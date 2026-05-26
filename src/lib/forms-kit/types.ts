export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'url';

export interface FieldConfig {
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  autoComplete?: string;
  maxLength?: number;
  rows?: number;
}

export interface FormConfig {
  id: string;
  fields: Record<string, FieldConfig>;
  submitLabel?: string;
  thanksMessage?: string;
}

export interface ClientConfig {
  apiBase: string;
  siteId: string;
  siteSecret: string;
}
