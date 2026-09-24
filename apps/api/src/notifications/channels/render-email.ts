import type { Notification } from '../notification';

const ACCENTS: Record<Notification['severity'], string> = {
  critical: '#e5484d',
  resolved: '#30a46c',
  warning: '#f5a524',
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderEmail(notification: Notification) {
  const { title, message, details, url, severity } = notification;

  const text = [
    title,
    '',
    message,
    '',
    ...details.map(({ label, value }) => `${label}: ${value}`),
    '',
    `View service: ${url}`,
  ].join('\n');

  const rows = details
    .map(
      ({ label, value }) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6f6f78;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1c1c1f;word-break:break-all">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;border-top:4px solid ${ACCENTS[severity]}">
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:20px;color:#1c1c1f">${escapeHtml(title)}</h1>
<p style="margin:0 0 20px;color:#3f3f46">${escapeHtml(message)}</p>
<table role="presentation" style="margin:0 0 24px;border-collapse:collapse">${rows}</table>
<a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 16px;background:#ff6422;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600">View service</a>
</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;color:#8a8a93;font-size:12px;text-align:center">You can change which alerts you receive in Emberline settings.</p>
</body></html>`;

  return { subject: title, text, html };
}
