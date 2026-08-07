import { ModuleConfig } from './types';

export const animalsConfig: ModuleConfig = {
  module: 'animals',
  title: 'Livestock & Cattle Registry',
  description: 'Manage herd animals, pedigree bulls, dam cows, and active cattle stock',
  route: '/animals',
  apiEndpoint: '/api/v1/stock',
  primaryKey: 'id',
  titleField: 'no',
  subtitleField: 'breed',
  imageField: 'imageUrl',
  searchableFields: ['no', 'breed', 'ownerName', 'location', 'tagId'],
  filterableFields: [
    {
      field: 'sex',
      label: 'Sex',
      options: [
        { label: 'Female ♀', value: 'Female', badgeColor: '#9D174D' },
        { label: 'Male ♂', value: 'Male', badgeColor: '#1D4ED8' },
      ],
    },
    {
      field: 'healthStatus',
      label: 'Health',
      options: [
        { label: 'Good', value: 'Good', badgeColor: '#16A34A' },
        { label: 'Sick', value: 'Sick', badgeColor: '#DC2626' },
        { label: 'Quarantine', value: 'Quarantine', badgeColor: '#D97706' },
      ],
    },
    {
      field: 'purpose',
      label: 'Purpose',
      options: [
        { label: 'Breeding', value: 'Breeding', badgeColor: '#0284C7' },
        { label: 'Fattening', value: 'Fattening', badgeColor: '#D97706' },
        { label: 'Dairy', value: 'Dairy', badgeColor: '#9333EA' },
      ],
    },
  ],
  sortableFields: [
    { field: 'created_at', label: 'Recently Added' },
    { field: 'no', label: 'Tag / Code' },
    { field: 'weight', label: 'Weight' },
    { field: 'age', label: 'Age' },
  ],
  columns: [
    { key: 'imageUrl', label: 'Photo', type: 'image' },
    { key: 'no', label: 'Tag ID / Code', sortable: true },
    { key: 'breed', label: 'Breed', sortable: true },
    { key: 'sex', label: 'Sex', type: 'badge', colorMap: { Female: '#9D174D', Male: '#1D4ED8' } },
    { key: 'weight', label: 'Weight (kg)', sortable: true },
    { key: 'age', label: 'Age' },
    { key: 'healthStatus', label: 'Health Status', type: 'badge', colorMap: { Good: '#16A34A', Sick: '#DC2626', Quarantine: '#D97706' } },
    { key: 'location', label: 'Location' },
  ],
  cardFields: [
    { key: 'breed', label: 'Breed' },
    { key: 'weight', label: 'Weight (kg)' },
    { key: 'age', label: 'Age' },
    { key: 'healthStatus', label: 'Health', badge: true, colorMap: { Good: '#16A34A', Sick: '#DC2626', Quarantine: '#D97706' } },
  ],
  fields: [
    { name: 'imageUrl', label: 'Animal Photo', type: 'image', gridSpan: 12 },
    { name: 'no', label: 'Tag / Animal ID', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. COW-001' },
    { name: 'breed', label: 'Breed', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Brahman Red', value: 'Brahman Red' },
        { label: 'Brahman White', value: 'Brahman White' },
        { label: 'Angus Black', value: 'Angus Black' },
        { label: 'Wagyu A5', value: 'Wagyu A5' },
        { label: 'Charolais', value: 'Charolais' },
        { label: 'Indu-Brazil', value: 'Indu-Brazil' },
        { label: 'Nelore', value: 'Nelore' },
        { label: 'Local Mixed', value: 'Local Mixed' },
      ]
    },
    { name: 'sex', label: 'Sex', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Female (Dam / Cow)', value: 'Female' },
        { label: 'Male (Sire / Bull)', value: 'Male' },
      ]
    },
    { name: 'purpose', label: 'Purpose', type: 'select', defaultValue: 'Breeding', gridSpan: 6, options: [
        { label: 'Breeding', value: 'Breeding' },
        { label: 'Fattening', value: 'Fattening' },
        { label: 'Dairy', value: 'Dairy' },
      ]
    },
    { name: 'weight', label: 'Weight (kg)', type: 'number', required: true, gridSpan: 6, placeholder: '0.00' },
    { name: 'age', label: 'Age / Age Group', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. 2 Years 4 Months' },
    { name: 'ownerName', label: 'Cow Owner Name', type: 'text', gridSpan: 6 },
    { name: 'location', label: 'Farm Location / Pen', type: 'text', gridSpan: 6, placeholder: 'e.g. Pen A-1' },
    { name: 'damId', label: 'Dam (Mother Cow)', type: 'select', apiSource: '/api/v1/stock?sex=Female', gridSpan: 6 },
    { name: 'sireId', label: 'Sire (Father Bull)', type: 'select', apiSource: '/api/v1/stock?sex=Male', gridSpan: 6 },
    { name: 'healthStatus', label: 'Health Status', type: 'select', defaultValue: 'Good', gridSpan: 6, options: [
        { label: 'Good', value: 'Good' },
        { label: 'Sick', value: 'Sick' },
        { label: 'Quarantine', value: 'Quarantine' },
      ]
    },
    { name: 'remark', label: 'Remarks & Notes', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'General Animal Information',
      icon: '🐄',
      fields: ['no', 'breed', 'sex', 'purpose', 'location', 'ownerName'],
    },
    {
      id: 'stats',
      title: 'Physical Statistics',
      icon: '📊',
      fields: ['weight', 'age', 'healthStatus'],
    },
    {
      id: 'lineage',
      title: 'Pedigree Lineage',
      icon: '🧬',
      fields: ['damId', 'sireId'],
    },
  ],
};
