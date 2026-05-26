// forms.config.mjs — declarative registration of this site's forms with the
// RYCM forms-service. Synced via tools/forms-sync.mjs in the forms-service repo.
// See forms-service/FORMS.md for the integration contract.
//
// Field schema MUST match the React component in
// src/components/ContactFormApp.tsx — server validates from this file, client
// renders from there. Edit them together.

export default {
  siteId: 'rycm',
  forms: {
    'rycm-contact': {
      name: 'Book a call enquiry',
      recipients: ['hello@resultsyoucanmeasure.com'],
      retention_days: 365,
      schema: {
        fields: {
          name: { label: 'Your name', type: 'text', required: true },
          email: { label: 'Email', type: 'email', required: true },
          phone: { label: 'Phone', type: 'tel' },
          company: { label: 'Company / role', type: 'text' },
          message: {
            label: 'What would make the biggest difference for you right now?',
            type: 'textarea',
            required: true,
          },
        },
      },
    },
  },
};
