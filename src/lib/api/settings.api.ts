import { apiFetch } from './api-client';

export const settingsApi = {
  getByKey: <T>(key: string) => apiFetch<T>(`/settings/key/${key}`),
  setByKey: <T>(key: string, data: T) => apiFetch<T>(`/settings/key/${key}`, { method: 'POST', body: JSON.stringify(data) }),
};
