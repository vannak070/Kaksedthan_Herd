import { ModuleConfig } from './types';

export const weightConfig: ModuleConfig = {
  module: 'weight',
  title: 'Weight & Growth Tracking',
  description: 'Track daily weight gains, growth curves, and feeding efficiency',
  route: '/weight',
  apiEndpoint: '/api/v1/weight',
  primaryKey: 'id',
  titleField: 'cowId',
  subtitleField: 'currentWeight',
  searchableFields: ['id', 'cowId', 'breed', 'healthStatus', 'status'],
  filterableFields: [
    {
      field: 'healthStatus',
      label: 'Health Status',
      options: [
        { label: 'Good', value: 'Good', badgeColor: '#16A34A' },
        { label: 'Fair', value: 'Fair', badgeColor: '#D97706' },
        { label: 'Poor', value: 'Poor', badgeColor: '#DC2626' },
      ],
    },
  ],
  sortableFields: [
    { field: 'trackingDate', label: 'Weighing Date' },
    { field: 'currentWeight', label: 'Current Weight' },
    { field: 'gainLoss', label: 'Weight Gain / Loss' },
  ],
  columns: [
    { key: 'id', label: 'Log ID', sortable: true },
    { key: 'cowId', label: 'Cow Tag', sortable: true },
    { key: 'trackingDate', label: 'Date Measured', type: 'date', sortable: true },
    { key: 'oldWeight', label: 'Previous (kg)', sortable: true },
    { key: 'currentWeight', label: 'Current (kg)', sortable: true },
    { key: 'gainLoss', label: 'Gain / Loss (kg)', sortable: true },
    { key: 'healthStatus', label: 'Health State', type: 'badge' },
  ],
  cardFields: [
    { key: 'cowId', label: 'Cow Tag' },
    { key: 'currentWeight', label: 'Current (kg)' },
    { key: 'gainLoss', label: 'Net Gain (kg)' },
    { key: 'trackingDate', label: 'Measured' },
  ],
  fields: [
    { name: 'cowId', label: 'Cow Tag ID', type: 'select', required: true, apiSource: '/api/v1/stock', gridSpan: 6 },
    { name: 'trackingDate', label: 'Weighing Date', type: 'date', required: true, gridSpan: 6 },
    { name: 'oldWeight', label: 'Previous Weight (kg)', type: 'number', required: true, gridSpan: 6, defaultValue: 0 },
    { name: 'currentWeight', label: 'Current Weight (kg)', type: 'number', required: true, gridSpan: 6, defaultValue: 0 },
    { name: 'healthStatus', label: 'Health Condition', type: 'select', defaultValue: 'Good', gridSpan: 6, options: [
        { label: 'Good', value: 'Good' },
        { label: 'Fair', value: 'Fair' },
        { label: 'Poor', value: 'Poor' },
      ]
    },
  ],
  detailSections: [
    {
      id: 'general',
      title: 'Growth Measurement Record',
      icon: '⚖️',
      fields: ['cowId', 'trackingDate', 'oldWeight', 'currentWeight', 'gainLoss', 'healthStatus'],
    },
  ],
};
