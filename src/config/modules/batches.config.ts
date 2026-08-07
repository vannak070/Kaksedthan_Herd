import { ModuleConfig } from './types';

export const batchesConfig: ModuleConfig = {
  module: 'batches',
  title: 'Herd Batches & Group Management',
  description: 'Manage fattening batches, breeding groups, and pen assignments',
  route: '/batches',
  apiEndpoint: '/api/v1/batches',
  primaryKey: 'id',
  titleField: 'name',
  subtitleField: 'id',
  searchableFields: ['id', 'name', 'type', 'farmLocation', 'notes'],
  filterableFields: [
    {
      field: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active', badgeColor: '#16A34A' },
        { label: 'Completed', value: 'Completed', badgeColor: '#2563EB' },
        { label: 'Archived', value: 'Archived', badgeColor: '#6B7280' },
      ],
    },
    {
      field: 'type',
      label: 'Batch Type',
      options: [
        { label: 'Fattening', value: 'Fattening', badgeColor: '#D97706' },
        { label: 'Breeding Herd', value: 'Breeding', badgeColor: '#0284C7' },
        { label: 'Quarantine', value: 'Quarantine', badgeColor: '#DC2626' },
      ],
    },
  ],
  sortableFields: [
    { field: 'startDate', label: 'Start Date' },
    { field: 'name', label: 'Batch Name' },
    { field: 'created_at', label: 'Recently Created' },
  ],
  columns: [
    { key: 'id', label: 'Batch Code', sortable: true },
    { key: 'name', label: 'Batch Name', sortable: true },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'startDate', label: 'Start Date', type: 'date', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', colorMap: { Active: '#16A34A', Completed: '#2563EB', Archived: '#6B7280' } },
    { key: 'farmLocation', label: 'Location' },
  ],
  cardFields: [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'startDate', label: 'Start Date' },
    { key: 'status', label: 'Status', badge: true, colorMap: { Active: '#16A34A', Completed: '#2563EB' } },
  ],
  fields: [
    { name: 'id', label: 'Batch Code', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. BATCH-001' },
    { name: 'name', label: 'Batch Title', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. Q3 Fattening Bulls' },
    { name: 'type', label: 'Batch Type', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Fattening Batch', value: 'Fattening' },
        { label: 'Breeding Herd', value: 'Breeding' },
        { label: 'Quarantine Group', value: 'Quarantine' },
      ]
    },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'Active', gridSpan: 6, options: [
        { label: 'Active', value: 'Active' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Archived', value: 'Archived' },
      ]
    },
    { name: 'farmLocation', label: 'Farm Location / Pen', type: 'text', gridSpan: 6, placeholder: 'e.g. Kampong Cham Facility' },
    { name: 'expectedSellingPrice', label: 'Target Target Sale Price ($)', type: 'number', gridSpan: 6, defaultValue: 0 },
    { name: 'notes', label: 'Notes & Feeding Strategy', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Batch Information',
      icon: '🐂',
      fields: ['id', 'name', 'type', 'startDate', 'status', 'farmLocation', 'expectedSellingPrice'],
    },
  ],
};
