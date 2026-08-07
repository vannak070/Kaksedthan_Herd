import { ModuleConfig } from './types';

export const breedingConfig: ModuleConfig = {
  module: 'breeding',
  title: 'Breeding Operations & Inseminations',
  description: 'Track sire semen straws, dam cows, AI/natural breeding logs, and gestation cycles',
  route: '/breeding',
  apiEndpoint: '/api/v1/breeding',
  primaryKey: 'id',
  titleField: 'id',
  subtitleField: 'pregnancyStatus',
  imageField: 'imageUrl',
  searchableFields: ['id', 'damId', 'sireId', 'technician', 'notes', 'bullName'],
  filterableFields: [
    {
      field: 'pregnancyStatus',
      label: 'Pregnancy Status',
      options: [
        { label: 'Pending PD', value: 'Pending', badgeColor: '#D97706' },
        { label: 'Confirmed Pregnant', value: 'Confirmed Pregnant', badgeColor: '#16A34A' },
        { label: 'Open / Failed', value: 'Open', badgeColor: '#DC2626' },
        { label: 'Calved', value: 'Calved', badgeColor: '#2563EB' },
      ],
    },
    {
      field: 'breedingType',
      label: 'Breeding Method',
      options: [
        { label: 'Artificial Insemination (AI)', value: 'AI', badgeColor: '#0284C7' },
        { label: 'Natural Service', value: 'Natural', badgeColor: '#059669' },
      ],
    },
  ],
  sortableFields: [
    { field: 'matingDate', label: 'Insemination Date' },
    { field: 'expectedCalvingDate', label: 'Expected Calving' },
    { field: 'created_at', label: 'Recently Created' },
  ],
  columns: [
    { key: 'id', label: 'Record ID', sortable: true },
    { key: 'damId', label: 'Dam Cow', sortable: true },
    { key: 'sireId', label: 'Sire Bull / Straw', sortable: true },
    { key: 'matingDate', label: 'Insemination Date', type: 'date', sortable: true },
    { key: 'breedingType', label: 'Method', type: 'badge' },
    { key: 'pregnancyStatus', label: 'Status', type: 'badge', colorMap: { Pending: '#D97706', 'Confirmed Pregnant': '#16A34A', Open: '#DC2626', Calved: '#2563EB' } },
    { key: 'expectedCalvingDate', label: 'Expected Calving', type: 'date' },
  ],
  cardFields: [
    { key: 'damId', label: 'Dam' },
    { key: 'sireId', label: 'Sire' },
    { key: 'matingDate', label: 'Date' },
    { key: 'pregnancyStatus', label: 'Status', badge: true, colorMap: { Pending: '#D97706', 'Confirmed Pregnant': '#16A34A', Open: '#DC2626', Calved: '#2563EB' } },
  ],
  fields: [
    { name: 'damId', label: 'Dam Cow (Mother)', type: 'select', required: true, apiSource: '/api/v1/stock?sex=Female', gridSpan: 6 },
    { name: 'sireId', label: 'Sire Bull / Straw ID', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. STR-9901' },
    { name: 'matingDate', label: 'Insemination / Service Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'breedingType', label: 'Breeding Method', type: 'select', defaultValue: 'AI', gridSpan: 6, options: [
        { label: 'Artificial Insemination (AI)', value: 'AI' },
        { label: 'Natural Service', value: 'Natural' },
      ]
    },
    { name: 'technician', label: 'Veterinarian / Technician', type: 'text', gridSpan: 6, placeholder: 'Dr. Somethea' },
    { name: 'pregnancyStatus', label: 'Pregnancy Status', type: 'select', defaultValue: 'Pending', gridSpan: 6, options: [
        { label: 'Pending PD Check', value: 'Pending' },
        { label: 'Confirmed Pregnant', value: 'Confirmed Pregnant' },
        { label: 'Open (Not Pregnant)', value: 'Open' },
        { label: 'Calved', value: 'Calved' },
      ]
    },
    { name: 'pregnancyCheckDate', label: 'PD Checkup Date', type: 'date', gridSpan: 6 },
    { name: 'expectedCalvingDate', label: 'Expected Calving Date (+283 Days)', type: 'date', gridSpan: 6 },
    { name: 'breedingServiceCost', label: 'Service Cost (KHR)', type: 'number', gridSpan: 6, defaultValue: 0 },
    { name: 'breedingInseminationCost', label: 'Insemination Straw Cost (KHR)', type: 'number', gridSpan: 6, defaultValue: 0 },
    { name: 'notes', label: 'Veterinary Observations & Remarks', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Breeding & Service Details',
      icon: '💉',
      fields: ['id', 'matingDate', 'breedingType', 'technician', 'pregnancyStatus'],
    },
    {
      id: 'lineage',
      title: 'Pedigree Parents',
      icon: '🧬',
      fields: ['damId', 'sireId'],
    },
    {
      id: 'timeline',
      title: 'Reproduction Timeline & Gestation',
      icon: '📅',
      fields: ['pregnancyCheckDate', 'expectedCalvingDate', 'actualCalvingDate'],
    },
    {
      id: 'financials',
      title: 'Service Costs',
      icon: '៛',
      fields: ['breedingServiceCost', 'breedingInseminationCost'],
    },
  ],
};
