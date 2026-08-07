import { ModuleConfig } from './types';

export const salesConfig: ModuleConfig = {
  module: 'sales',
  title: 'Cattle Sales & Revenue',
  description: 'Track cattle sales, buyer receipts, live weight valuations, and total revenue',
  route: '/sales',
  apiEndpoint: '/api/v1/sales',
  primaryKey: 'id',
  titleField: 'cowId',
  subtitleField: 'buyer',
  searchableFields: ['id', 'cowId', 'buyer', 'saleType', 'status'],
  filterableFields: [
    {
      field: 'status',
      label: 'Sale Status',
      options: [
        { label: 'Sold', value: 'Sold', badgeColor: '#16A34A' },
        { label: 'Pending Payment', value: 'Pending', badgeColor: '#D97706' },
      ],
    },
  ],
  sortableFields: [
    { field: 'salesDate', label: 'Sale Date' },
    { field: 'totalPrice', label: 'Total Revenue' },
  ],
  columns: [
    { key: 'id', label: 'Sale ID', sortable: true },
    { key: 'cowId', label: 'Cattle Tag', sortable: true },
    { key: 'buyer', label: 'Buyer Name', sortable: true },
    { key: 'weight', label: 'Final Weight (kg)' },
    { key: 'totalPrice', label: 'Total Price ($)', sortable: true },
    { key: 'salesDate', label: 'Sale Date', type: 'date', sortable: true },
    { key: 'status', label: 'Status', type: 'badge', colorMap: { Sold: '#16A34A', Pending: '#D97706' } },
  ],
  cardFields: [
    { key: 'cowId', label: 'Cattle Tag' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'totalPrice', label: 'Total ($)' },
    { key: 'salesDate', label: 'Date' },
  ],
  fields: [
    { name: 'cowId', label: 'Cattle Tag ID', type: 'select', required: true, apiSource: '/api/v1/stock', gridSpan: 6 },
    { name: 'buyer', label: 'Buyer Name / Business', type: 'text', required: true, gridSpan: 6, placeholder: 'e.g. Phnom Penh Meat Distributors' },
    { name: 'weight', label: 'Final Sale Weight (kg)', type: 'number', required: true, gridSpan: 6 },
    { name: 'unitPrice', label: 'Unit Price per kg ($)', type: 'number', required: true, gridSpan: 6 },
    { name: 'totalPrice', label: 'Total Sale Amount ($)', type: 'number', required: true, gridSpan: 6 },
    { name: 'salesDate', label: 'Transaction Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'saleType', label: 'Sale Type', type: 'select', defaultValue: 'Direct', gridSpan: 6, options: [
        { label: 'Direct Farm Sale', value: 'Direct' },
        { label: 'Auction', value: 'Auction' },
        { label: 'Slaughterhouse Contract', value: 'Slaughterhouse' },
      ]
    },
    { name: 'status', label: 'Payment Status', type: 'select', defaultValue: 'Sold', gridSpan: 6, options: [
        { label: 'Sold & Paid', value: 'Sold' },
        { label: 'Pending Payment', value: 'Pending' },
      ]
    },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Sales Record & Invoice Details',
      icon: '💰',
      fields: ['cowId', 'buyer', 'weight', 'unitPrice', 'totalPrice', 'salesDate', 'saleType', 'status'],
    },
  ],
};
