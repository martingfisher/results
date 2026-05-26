import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClientConfig, FormConfig } from './types.js';
import { Field } from './fields.jsx';
import { submitForm } from './submit.js';

export interface FormProps {
  client: ClientConfig;
  config: FormConfig;
  onSuccess?: (id: string) => void;
  className?: string;
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; id: string; thanks: string }
  | { kind: 'error'; message: string };

export function Form({ client, config, onSuccess, className }: FormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of Object.keys(config.fields)) init[k] = '';
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>({ kind: 'idle' });
  const honeypotRef = useRef<HTMLInputElement>(null);
  const renderedAt = useMemo(() => Date.now(), []);

  // Auto-captured source envelope, attached to every submission. Mount-time
  // snapshot of the user's browser context so the server-side notification
  // email + admin detail can identify which page the form was rendered on
  // and what the user-device clock said. Server timestamp + sender_ip
  // remain the authoritative audit trail; this is forensic supplement.
  const sourceMeta = useMemo<Record<string, string | null> | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    try {
      return {
        pageUrl: window.location.href,
        pagePath: window.location.pathname,
        pageTitle: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        renderedAtIso: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
    } catch {
      return undefined;
    }
  }, []);

  if (state.kind === 'success') {
    return (
      <output className={`fk ${className ?? ''}`}>
        <div className="fk-thanks">{state.thanks}</div>
      </output>
    );
  }

  function setField(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'submitting' });

    const local = validateLocal(values, config);
    if (Object.keys(local).length > 0) {
      setErrors(local);
      setState({ kind: 'idle' });
      return;
    }

    const result = await submitForm({
      client,
      formId: config.id,
      data: values,
      ts: renderedAt,
      honeypot: honeypotRef.current?.value ?? '',
      source: sourceMeta,
    });

    if (result.ok && result.id) {
      onSuccess?.(result.id);
      setState({
        kind: 'success',
        id: result.id,
        thanks: result.thanks ?? config.thanksMessage ?? "Thanks — we'll be in touch.",
      });
      return;
    }
    if (result.fieldErrors) {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(result.fieldErrors)) {
        flat[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
      }
      setErrors(flat);
      setState({ kind: 'idle' });
      return;
    }
    setState({
      kind: 'error',
      message:
        result.error === 'rate_limited'
          ? "You've sent a few of these already. Please try again later."
          : "Sorry — something went wrong. Please try again, or email us directly.",
    });
  }

  return (
    <form
      className={`fk ${className ?? ''}`}
      onSubmit={onSubmit}
      noValidate
      data-state={state.kind}
    >
      <input
        ref={honeypotRef}
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="fk-honeypot"
      />
      {Object.entries(config.fields).map(([name, field]) => (
        <Field
          key={name}
          name={name}
          config={field}
          value={values[name] ?? ''}
          error={errors[name]}
          onChange={(v) => setField(name, v)}
        />
      ))}
      {state.kind === 'error' && (
        <div className="fk-error fk-error--global" role="alert">{state.message}</div>
      )}
      <button
        type="submit"
        className="fk-submit"
        disabled={state.kind === 'submitting'}
      >
        {state.kind === 'submitting' ? 'Sending…' : config.submitLabel ?? 'Send'}
      </button>
    </form>
  );
}

function validateLocal(values: Record<string, string>, config: FormConfig): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [name, field] of Object.entries(config.fields)) {
    const v = values[name] ?? '';
    if (field.required && v.trim().length === 0) {
      errors[name] = 'Required';
      continue;
    }
    if (v.length > 0 && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      errors[name] = 'Please enter a valid email address';
    }
  }
  return errors;
}
