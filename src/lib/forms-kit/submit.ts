import type { ClientConfig } from './types.js';

export interface SubmitResult {
  ok: boolean;
  id?: string;
  thanks?: string;
  quarantined?: boolean;
  fieldErrors?: Record<string, string[]>;
  error?: string;
}

export async function submitForm(args: {
  client: ClientConfig;
  formId: string;
  data: Record<string, unknown>;
  ts: number;
  honeypot?: string;
  /** Auto-captured browser context from Form.tsx (pageUrl, pageTitle,
      referrer, renderedAtIso, userAgent). Used by the server to render
      a "Submission source" footer on every notification email and to
      populate the admin detail view. Optional for backwards compat. */
  source?: Record<string, string | null> | undefined;
}): Promise<SubmitResult> {
  const url = `${args.client.apiBase}/v1/submit/${args.client.siteId}/${args.formId}`;
  const meta: Record<string, unknown> = {
    ts: args.ts,
    honeypot: args.honeypot ?? '',
  };
  if (args.source) meta.source = args.source;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Secret': args.client.siteSecret,
      },
      body: JSON.stringify({
        data: args.data,
        meta,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as SubmitResult;
    // Spread body first so the explicit ok flag based on res.ok wins —
    // otherwise body.ok from the server payload could silently override
    // the actual HTTP-status truth (TS2783 also flagged this).
    if (!res.ok) {
      return { ...body, ok: false };
    }
    return { ...body, ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' };
  }
}
