import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, subscribeAuth } from '../api/client';

const AdminContext = createContext(null);
const normalizeAlert = (a) => ({ ...a, tier: a.tier || a.alertTier, type: a.type || a.alertType, alertId: a.alertId || a._id });
const normalizeUser = (user) => ({ ...user, lastActive: user.lastActive || user.lastActiveAt || user.createdAt || new Date().toISOString() });

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [totals, setTotals] = useState({ users: 0, active: 0, suspended: 0, newThisWeek: 0, dormant: 0, drugs: 0, batches: 0, unitsSoldThisWeek: 0, openAlerts: 0, attention: 0, expired: 0, weekly: [] });

  const loadUsers = useCallback(async () => {
    if (!getToken()) return [];
    const usersResult = await api.request('/admin/users?filter=all&limit=100');
    const users = (usersResult.users || []).map(normalizeUser);
    const details = await Promise.all(users.map(async (user) => {
      try {
        const detail = await api.request(`/admin/users/${user.userId}`);
        return { ...user, drugs: detail.drugs || [], alerts: (detail.alerts || []).map(normalizeAlert), activity: detail.activity || [], weekly: detail.weekly?.series || [] };
      } catch {
        return { ...user, drugs: [], alerts: [], activity: [], weekly: [] };
      }
    }));
    setPharmacies(details);
    return details;
  }, []);

  const load = useCallback(async () => {
    if (!getToken()) return;
    await loadUsers();
    const [meResult, overviewResult, alertsResult, activityResult] = await Promise.allSettled([
      api.request('/admin/me'), api.request('/admin/overview'), api.request('/admin/alerts?limit=200'), api.request('/admin/activity?limit=200'),
    ]);
    if (meResult.status === 'fulfilled') setAdmin(meResult.value.admin);
    if (overviewResult.status === 'fulfilled') {
      const overview = overviewResult.value;
      setTotals({ ...(overview.totals || {}), dormant: overview.totals?.inactive || 0, weekly: overview.weekly?.series || [] });
    }
    if (alertsResult.status === 'fulfilled') setAlerts((alertsResult.value.alerts || []).map(normalizeAlert));
    if (activityResult.status === 'fulfilled') setActivity(activityResult.value.activity || []);
  }, [loadUsers]);

  useEffect(() => {
    let active = true;
    const refresh = () => { if (active && getToken()) load().catch(() => {}); };
    refresh();
    const unsubscribe = subscribeAuth(refresh);
    return () => { active = false; unsubscribe(); };
  }, [load]);

  const getUser = useCallback((userId) => pharmacies.find((user) => user.userId === userId), [pharmacies]);
  const updateUser = useCallback((userId, userPatch) => setPharmacies((prev) => prev.map((user) => user.userId === userId ? { ...user, ...userPatch } : user)), []);
  const suspendUser = useCallback(async (userId) => { const result = await api.request(`/admin/users/${userId}/suspend`, { method: 'POST' }); updateUser(userId, result.user); }, [updateUser]);
  const reactivateUser = useCallback(async (userId) => { const result = await api.request(`/admin/users/${userId}/reactivate`, { method: 'POST' }); updateUser(userId, result.user); }, [updateUser]);
  const resetPassword = useCallback(async (userId) => { const result = await api.request(`/admin/users/${userId}/reset-password`, { method: 'POST' }); updateUser(userId, result.user); return result.temporaryPassword; }, [updateUser]);
  const deleteUser = useCallback(async (userId) => { await api.request(`/admin/users/${userId}`, { method: 'DELETE' }); setPharmacies((prev) => prev.filter((user) => user.userId !== userId)); }, []);
  const adminLogin = useCallback(() => null, []);
  const checkLogin = useCallback(() => ({ ok: true }), []);
  const value = useMemo(() => ({ admin, pharmacies, alerts, activity, totals, getUser, refreshUsers: loadUsers, suspendUser, reactivateUser, resetPassword, deleteUser, adminLogin, checkLogin }), [admin, pharmacies, alerts, activity, totals, getUser, loadUsers, suspendUser, reactivateUser, resetPassword, deleteUser, adminLogin, checkLogin]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
