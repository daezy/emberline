import { renderEmail } from './channels/render-email';
import { buildNotification } from './notification';
import type { NotificationContext } from './notification';

const context: NotificationContext = {
  service: {
    id: 'svc-1',
    name: 'Billing <API>',
    endpoint: 'https://api.example.com/health',
  },
  check: {
    responseStatus: null,
    latencyMs: null,
    errorMessage: 'Connection refused',
    checkedAt: new Date('2026-09-24T11:00:00Z'),
  },
  timezone: 'Africa/Lagos',
  webAppUrl: 'https://app.emberline.dev',
};

describe('buildNotification', () => {
  it('describes an outage with the error and local time', () => {
    const notification = buildNotification(
      {
        type: 'service.down',
        serviceId: 'svc-1',
        checkId: 'chk-1',
        failureCount: 2,
        occurredAt: '2026-09-24T11:00:00Z',
      },
      context,
    );
    expect(notification).toMatchObject({
      severity: 'critical',
      title: 'Billing <API> is down',
      url: 'https://app.emberline.dev/dashboard/services/svc-1',
    });
    expect(notification.details).toContainEqual({
      label: 'Error',
      value: 'Connection refused',
    });
    expect(
      notification.details.find((detail) => detail.label === 'Checked at')
        ?.value,
    ).toMatch(/12:00/);
  });

  it('includes how long ago the outage was reported', () => {
    const notification = buildNotification(
      {
        type: 'service.recovered',
        serviceId: 'svc-1',
        checkId: 'chk-2',
        reportedDownAt: '2026-09-24T09:30:00Z',
        occurredAt: '2026-09-24T11:00:00Z',
      },
      {
        ...context,
        check: { ...context.check!, latencyMs: 240, errorMessage: null },
      },
    );
    expect(notification.severity).toBe('resolved');
    expect(notification.message).toMatch(/about 1 h 30 min/);
  });
});

describe('renderEmail', () => {
  it('escapes user-controlled text in the HTML body', () => {
    const email = renderEmail(
      buildNotification(
        {
          type: 'service.down',
          serviceId: 'svc-1',
          checkId: 'chk-1',
          failureCount: 2,
          occurredAt: '2026-09-24T11:00:00Z',
        },
        context,
      ),
    );
    expect(email.subject).toBe('Billing <API> is down');
    expect(email.html).toContain('Billing &lt;API&gt; is down');
    expect(email.html).not.toContain('<API>');
    expect(email.text).toContain(
      'View service: https://app.emberline.dev/dashboard/services/svc-1',
    );
  });
});
