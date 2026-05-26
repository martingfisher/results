import type { ChangeEvent } from 'react';
import type { FieldConfig } from './types.js';

interface FieldProps {
  name: string;
  config: FieldConfig;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function Field({ name, config, value, error, onChange }: FieldProps) {
  const id = `fk-${name}`;
  const describedBy = [
    config.helpText ? `${id}-help` : null,
    error ? `${id}-err` : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={`fk-field${error ? ' fk-field--error' : ''}`}>
      <label htmlFor={id} className="fk-label">
        {config.label}
        {config.required && <span className="fk-required" aria-hidden="true"> *</span>}
      </label>
      {renderControl(id, name, config, value, onChange, describedBy)}
      {config.helpText && !error && (
        <div id={`${id}-help`} className="fk-help">{config.helpText}</div>
      )}
      {error && (
        <div id={`${id}-err`} className="fk-error" role="alert">{error}</div>
      )}
    </div>
  );
}

function renderControl(
  id: string,
  name: string,
  config: FieldConfig,
  value: string,
  onChange: (v: string) => void,
  describedBy: string | undefined,
) {
  const common = {
    id,
    name,
    value,
    'aria-describedby': describedBy,
    'aria-invalid': !!describedBy && describedBy.endsWith('-err') ? true : undefined,
    required: config.required,
    placeholder: config.placeholder,
    autoComplete: config.autoComplete,
    maxLength: config.maxLength,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(e.currentTarget.value),
  };

  if (config.type === 'textarea') {
    return <textarea className="fk-control fk-textarea" rows={config.rows ?? 5} {...common} />;
  }
  if (config.type === 'select') {
    return (
      <select className="fk-control fk-select" {...common}>
        <option value="">{config.placeholder ?? 'Select…'}</option>
        {(config.options ?? []).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  const inputType =
    config.type === 'email'
      ? 'email'
      : config.type === 'tel'
        ? 'tel'
        : config.type === 'number'
          ? 'number'
          : config.type === 'url'
            ? 'url'
            : 'text';
  return <input className="fk-control fk-input" type={inputType} {...common} />;
}
