import { ModuleConfig } from './types';

export const feedConfig: ModuleConfig = {
  module: 'feed',
  title: 'Feed Inventory & Products',
  description: 'Manage fodder, concentrates, premix bags, and inventory threshold alerts',
  route: '/feed',
  apiEndpoint: '/api/v1/feed',
  primaryKey: 'id',
  titleField: 'name',
  subtitleField: 'category',
  searchableFields: ['id', 'name', 'category', 'supplier', 'description'],
  filterableFields: [
    {
      field: 'status',
      label: 'Inventory Status',
      options: [
        { label: 'Active', value: 'Active', badgeColor: '#16A34A' },
        { label: 'Low Stock Alert', value: 'Low Stock', badgeColor: '#DC2626' },
      ],
    },
  ],
  sortableFields: [
    { field: 'name', label: 'Feed Name' },
    { field: 'unitCost', label: 'Unit Price' },
  ],
  columns: [
    { key: 'id', label: 'SKU / ID', sortable: true },
    { key: 'name', label: 'Feed Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'unit', label: 'Unit' },
    { key: 'weightPerUnit', label: 'Weight/Unit (kg)' },
    { key: 'unitCost', label: 'Unit Cost ($)', sortable: true },
    { key: 'status', label: 'Status', type: 'badge' },
  ],
  cardFields: [
    { key: 'category', label: 'Type' },
    { key: 'weightPerUnit', label: 'Weight (kg)' },
    { key: 'unitCost', label: 'Cost ($)' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { name: 'id', label: 'SKU Code', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. FEED-BAG-01' },
    { name: 'name', label: 'Feed Product Name', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. High Protein Cattle Concentrates' },
    { name: 'category', label: 'Category', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Concentrate Feed', value: 'Concentrate' },
        { label: 'Silage / Forage', value: 'Silage' },
        { label: 'Premix & Minerals', value: 'Premix' },
        { label: 'Hay / Straw', value: 'Hay' },
      ]
    },
    { name: 'unit', label: 'Packaging Unit', type: 'text', defaultValue: 'bag', gridSpan: 6 },
    { name: 'weightPerUnit', label: 'Weight per Unit (kg)', type: 'number', required: true, gridSpan: 6, defaultValue: 30 },
    { name: 'unitCost', label: 'Unit Price ($)', type: 'number', required: true, gridSpan: 6, defaultValue: 0 },
    { name: 'minThresholdBags', label: 'Low Stock Alert Threshold (Bags)', type: 'number', gridSpan: 6, defaultValue: 50 },
    { name: 'supplier', label: 'Supplier Name', type: 'text', gridSpan: 6 },
    { name: 'description', label: 'Product Description & Formula', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Feed Inventory Product Info',
      icon: '🌾',
      fields: ['id', 'name', 'category', 'unit', 'weightPerUnit', 'unitCost', 'minThresholdBags', 'supplier'],
    },
  ],
};
