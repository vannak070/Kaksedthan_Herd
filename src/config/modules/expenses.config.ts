import { ModuleConfig } from './types';

export const expensesConfig: ModuleConfig = {
  module: 'expenses',
  title: 'Farm Operational Expenses',
  description: 'Record operating expenses, veterinary costs, labor, and feed purchases',
  route: '/expenses',
  apiEndpoint: '/api/v1/expenses',
  primaryKey: 'id',
  titleField: 'category',
  subtitleField: 'id',
  searchableFields: ['id', 'category', 'description', 'farmLocation'],
  filterableFields: [
    {
      field: 'category',
      label: 'Category',
      options: [
        { label: 'Feed Purchase', value: 'Feed', badgeColor: '#0284C7' },
        { label: 'Veterinary & Medicine', value: 'Veterinary', badgeColor: '#DC2626' },
        { label: 'Labor & Wages', value: 'Labor', badgeColor: '#D97706' },
        { label: 'Utilities & Fuel', value: 'Utilities', badgeColor: '#9333EA' },
        { label: 'Equipment & Maintenance', value: 'Equipment', badgeColor: '#059669' },
      ],
    },
  ],
  sortableFields: [
    { field: 'date', label: 'Expense Date' },
    { field: 'amount', label: 'Amount' },
  ],
  columns: [
    { key: 'id', label: 'Receipt / EXP ID', sortable: true },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'amount', label: 'Amount ($)', sortable: true },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'farmLocation', label: 'Farm Facility' },
  ],
  cardFields: [
    { key: 'category', label: 'Category', badge: true },
    { key: 'amount', label: 'Amount ($)' },
    { key: 'date', label: 'Date' },
  ],
  fields: [
    { name: 'id', label: 'Receipt Code / ID', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. EXP-2026-001' },
    { name: 'category', label: 'Expense Category', type: 'select', required: true, gridSpan: 6, options: [
        { label: 'Feed Purchase', value: 'Feed' },
        { label: 'Veterinary & Medicine', value: 'Veterinary' },
        { label: 'Labor & Wages', value: 'Labor' },
        { label: 'Utilities & Fuel', value: 'Utilities' },
        { label: 'Equipment & Maintenance', value: 'Equipment' },
      ]
    },
    { name: 'amount', label: 'Expense Amount (USD)', type: 'number', required: true, gridSpan: 6, defaultValue: 0 },
    { name: 'date', label: 'Transaction Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'farmLocation', label: 'Farm Location', type: 'text', gridSpan: 6 },
    { name: 'description', label: 'Expense Description & Vendor Info', type: 'textarea', gridSpan: 12 },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Expense Record Details',
      icon: '💵',
      fields: ['id', 'category', 'amount', 'date', 'farmLocation'],
    },
  ],
};
