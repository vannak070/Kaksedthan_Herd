import { ModuleConfig } from './types';

export const healthConfig: ModuleConfig = {
  module: 'health',
  title: 'Health & Vaccination Logs',
  description: 'Track vaccinations, treatments, deworming, and veterinary health logs',
  route: '/health',
  apiEndpoint: '/api/v1/health',
  primaryKey: 'id',
  titleField: 'name',
  subtitleField: 'type',
  searchableFields: ['id', 'cowId', 'name', 'type', 'administeredBy', 'notes'],
  filterableFields: [
    {
      field: 'type',
      label: 'Log Category',
      options: [
        { label: 'Vaccination', value: 'Vaccination', badgeColor: '#16A34A' },
        { label: 'Treatment', value: 'Treatment', badgeColor: '#DC2626' },
        { label: 'Deworming', value: 'Deworming', badgeColor: '#D97706' },
        { label: 'Disease Inspection', value: 'Disease', badgeColor: '#9333EA' },
      ],
    },
  ],
  sortableFields: [
    { field: 'date', label: 'Log Date' },
    { field: 'cost', label: 'Treatment Cost' },
  ],
  columns: [
    { key: 'id', label: 'Log ID', sortable: true },
    { key: 'cowId', label: 'Cow Tag', sortable: true },
    { key: 'type', label: 'Category', type: 'badge' },
    { key: 'name', label: 'Treatment / Vaccine Name', sortable: true },
    { key: 'date', label: 'Administered Date', type: 'date', sortable: true },
    { key: 'administeredBy', label: 'Veterinarian' },
    { key: 'cost', label: 'Cost (USD)', sortable: true },
  ],
  cardFields: [
    { key: 'cowId', label: 'Animal' },
    { key: 'type', label: 'Category', badge: true },
    { key: 'date', label: 'Date' },
    { key: 'cost', label: 'Cost ($)' },
  ],
  fields: [
    { name: 'cowId', label: 'Animal / Tag ID', type: 'select', required: true, apiSource: '/api/v1/stock', gridSpan: 6 },
    { name: 'type', label: 'Log Category', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Vaccination', value: 'Vaccination' },
        { label: 'Treatment', value: 'Treatment' },
        { label: 'Deworming', value: 'Deworming' },
        { label: 'Disease Inspection', value: 'Disease' },
      ]
    },
    { name: 'name', label: 'Treatment / Medication Name', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. FMD Vaccine Round 1' },
    { name: 'date', label: 'Administration Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'administeredBy', label: 'Veterinarian / Technician', type: 'text', gridSpan: 6, placeholder: 'Dr. Vanna' },
    { name: 'cost', label: 'Treatment Cost (USD)', type: 'number', gridSpan: 6, defaultValue: 0 },
    { name: 'notes', label: 'Clinical Observations & Dosage', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Health Log Summary',
      icon: '🩺',
      fields: ['cowId', 'type', 'name', 'date', 'administeredBy', 'cost'],
    },
  ],
};
