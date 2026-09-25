import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Set EXPO_PUBLIC_API_URL to the reachable backend URL, including /api.
const DEFAULT_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
const getRuntimeApiUrl = () => {
  // expo config evaluated at build time
  const fromExpoConfig = Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.EXPO_PUBLIC_API_URL;
  // older SDKs / some runtimes expose manifest
  const fromManifest = Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.EXPO_PUBLIC_API_URL;
  const fromProcess = process.env && process.env.EXPO_PUBLIC_API_URL;
  return fromExpoConfig || fromManifest || fromProcess || null;
};

const RUNTIME_ENV_URL = getRuntimeApiUrl();
const BASE_URL = (RUNTIME_ENV_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

// Debug log to help verify which base URL the app resolves at runtime (dev only)
if (__DEV__) {
  try {
    // eslint-disable-next-line no-console
    console.log('[medvault] Resolved BASE_URL ->', BASE_URL, { fromExpoConfig: Constants.expoConfig && Constants.expoConfig.extra, fromManifest: Constants.manifest && Constants.manifest.extra });
  } catch (e) { }
}
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
  // Debug: log stored role and masked token (dev only)
  if (__DEV__) {
    try {
      const masked = nextToken ? `${nextToken.slice(0, 6)}...` : 'no-token';
      // eslint-disable-next-line no-console
      console.log('[medvault] persistSession ->', { maskedToken: masked, storedRole: role ? 'admin' : 'pharmacist' });
    } catch (e) {}
  }
  await AsyncStorage.multiSet([[TOKEN_KEY, nextToken], [ROLE_KEY, role ? 'admin' : 'pharmacist']]);
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  // Debug: log outgoing request details (mask token) (dev only)
  if (__DEV__) {
    try {
      const masked = token ? `${token.slice(0, 6)}...` : 'no-token';
      // eslint-disable-next-line no-console
      console.log('[medvault] Request ->', { method: options.method || 'GET', url: `${BASE_URL}${path}`, token: masked, headers });
    } catch (e) { }
  }
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[medvault] Network error ->', error && error.message);
    throw new Error('We couldn’t connect right now. Please check your internet connection and try again.');
  }
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { message: text }; }
  if (!response.ok) {
    // Debug: log response status and body for failed requests (dev only)
    if (__DEV__) {
      try {
        // eslint-disable-next-line no-console
        console.log('[medvault] Response ERROR ->', { url: `${BASE_URL}${path}`, status: response.status, body: payload });
      } catch (e) { }
    }
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
  // Change the signed-in user's password. Requires the current password (no email/OTP
  // verification step). The backend rotates the session token, so we store the new one.
  changePassword: async (currentPassword, newPassword) => {
    const result = await request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
    setToken(result.token, sessionRole);
    await persistSession(result.token, sessionRole === 'admin');
    return result;
  },
};

export default api;
