/**
 * Enterprise Module Configuration Schema
 * Enables metadata-driven CRUD, Dynamic Listing, Dynamic Detail, and Dynamic Forms
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'switch'
  | 'textarea'
  | 'image'
  | 'file';

export interface SelectOption {
  label: string;
  value: any;
  badgeColor?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: SelectOption[];
  apiSource?: string; // Endpoint for dynamic options (e.g. '/api/v1/stock?sex=Female')
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  gridSpan?: number; // 1 to 12
}

export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'image';
  sortable?: boolean;
  colorMap?: Record<string, string>;
}

export interface CardFieldConfig {
  key: string;
  label: string;
  badge?: boolean;
  icon?: string;
  colorMap?: Record<string, string>;
}

export interface DetailSectionConfig {
  id: string;
  title: string;
  icon?: string;
  fields: string[];
}

export interface ModuleConfig {
  module: string; // Machine identifier e.g., 'animals', 'breeding'
  title: string;
  description?: string;
  route: string;
  apiEndpoint: string;
  primaryKey: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  searchableFields: string[];
  filterableFields: {
    field: string;
    label: string;
    options: SelectOption[];
  }[];
  sortableFields: {
    field: string;
    label: string;
  }[];
  columns: ColumnConfig[];
  cardFields: CardFieldConfig[];
  fields: FieldConfig[];
  detailSections: DetailSectionConfig[];
  permissions?: {
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
  };
}
