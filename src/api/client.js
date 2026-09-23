import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Set EXPO_PUBLIC_API_URL to the reachable backend URL, including /api.
const DEFAULT_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
const RUNTIME_ENV_URL = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.EXPO_PUBLIC_API_URL) || process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = (RUNTIME_ENV_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
const TOKEN_KEY = '@medvault/session-token';
const ROLE_KEY = '@medvault/session-role';

let token = null;
let sessionRole = null;
const listeners = new Set();

export const getToken = () => token;
export const getSessionRole = () => sessionRole;
export const setToken = (nextToken, role = sessionRole) => {
  token = nextToken || null;
  sessionRole = token ? (role || null) : null;
  listeners.forEach((listener) => listener(token, sessionRole));
};
export const subscribeAuth = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

async function persistSession(nextToken, role) {
  if (!nextToken) {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
    return;
  }
  await AsyncStorage.multiSet([[TOKEN_KEY, nextToken], [ROLE_KEY, role ? 'admin' : 'pharmacist']]);
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  } catch (error) {
    throw new Error('We couldn’t connect right now. Please check your internet connection and try again.');
  }
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { message: text }; }
  if (!response.ok) {
    const fallback = response.status === 401
      ? 'Your session has ended. Please sign in again.'
      : response.status === 403
        ? 'You do not have permission to do that.'
        : response.status === 404
          ? 'We couldn’t find that record.'
          : response.status === 409
            ? 'That record already exists. Please check the details and try again.'
            : response.status >= 500
              ? 'Something went wrong on our side. Please try again in a moment.'
              : 'Please check the information and try again.';
    const error = new Error(response.status < 500 && payload.message ? payload.message : fallback);
    error.status = response.status;
    error.code = payload.code;
    error.details = payload.details;
    throw error;
  }
  return payload;
}

export async function restoreSession() {
  try {
    const stored = await AsyncStorage.multiGet([TOKEN_KEY, ROLE_KEY]);
    const storedToken = stored.find(([key]) => key === TOKEN_KEY)?.[1];
    const storedRole = stored.find(([key]) => key === ROLE_KEY)?.[1];
    if (!storedToken || !storedRole) return null;
    setToken(storedToken, storedRole === 'admin' ? 'admin' : 'pharmacist');
    await request(storedRole === 'admin' ? '/admin/me' : '/auth/me');
    return storedRole === 'admin' ? 'admin' : 'pharmacist';
  } catch (error) {
    setToken(null);
    await persistSession(null);
    return null;
  }
}

export const api = {
  request,
  login: async (identifier, password) => {
    const result = await request('/auth/login', { method: 'POST', body: { identifier, password } });
    setToken(result.token, result.isAdmin ? 'admin' : 'pharmacist');
    await persistSession(result.token, result.isAdmin);
    return result;
  },
  register: async (data) => {
    const result = await request('/auth/register', { method: 'POST', body: data });
    setToken(result.token, 'pharmacist');
    await persistSession(result.token, false);
    return result;
  },
  logout: async () => {
    setToken(null);
    await persistSession(null);
  },
  me: () => request('/auth/me'),
};

export default api;
