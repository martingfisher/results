/**
 * ContactFormApp — React island that mounts the in-house forms-kit Form
 * component for the RYCM agency "Book a call" form. Field schema must match
 * forms.config.mjs at the project root — server validates from there, client
 * renders from here.
 *
 * The explicit React import is the @astrojs/react Vite-plugin marker for
 * applying the JSX dev-runtime transform. Without it, the compiled output
 * references jsxDEV with no matching import. Don't remove.
 *
 * Replaces the Elfsight third-party widget that previously lived on /contact/
 * (case study: 2026-05-27 migration).
 */
import 'react';
import { type ClientConfig, Form, type FormConfig } from '../lib/forms-kit';
import '../lib/forms-kit/styles.css';
import { site } from '../lib/site';

const client: ClientConfig = {
  apiBase: site.forms.apiBase,
  siteId: site.forms.siteId,
  siteSecret: import.meta.env.PUBLIC_FORMS_SITE_SECRET as string,
};

const contact: FormConfig = {
  id: `${site.forms.siteId}-contact`,
  submitLabel: 'Book a call',
  thanksMessage:
    "Thanks — we'll be in touch within one working day to find a slot.",
  fields: {
    name: { label: 'Your name', type: 'text', required: true, autoComplete: 'name' },
    email: { label: 'Email', type: 'email', required: true, autoComplete: 'email' },
    phone: { label: 'Phone', type: 'tel', autoComplete: 'tel' },
    company: {
      label: 'Company / role',
      type: 'text',
      autoComplete: 'organization',
    },
    message: {
      label: 'What would make the biggest difference for you right now?',
      type: 'textarea',
      required: true,
      rows: 5,
    },
  },
};

export default function ContactFormApp() {
  return <Form client={client} config={contact} />;
}
