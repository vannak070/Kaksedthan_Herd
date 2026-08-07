import { apiFetch } from './api-client';
import { BreedingRecord } from '../../types';

export const breedingApi = {
  getAll: () => apiFetch<BreedingRecord[]>('/breeding'),
  getByDamId: (damId: string) => apiFetch<BreedingRecord[]>(`/breeding/dam/${damId}`),
  create: (data: Partial<BreedingRecord>) =>
    apiFetch<BreedingRecord>('/breeding', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, updates: Partial<BreedingRecord>) =>
    apiFetch<BreedingRecord>(`/breeding/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: string) => apiFetch<void>(`/breeding/${id}`, { method: 'DELETE' }),
};
