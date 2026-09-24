import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, gt, isNotNull, sql } from 'drizzle-orm';

import {
  DatabaseService,
  coldStartEvents,
  readinessChecks,
  services,
} from '../../database';
import type { AppDatabase } from '../../database';
import { NotificationsService } from '../../notifications';
import type { ServiceEvent } from '../../notifications';
import type { CheckJob } from '../../queue';
import { classify } from './classify';
import { EndpointProbe } from '../probe/endpoint-probe';
import { detectColdStart } from './cold-start';
import {
  COLD_STARTS_WINDOW_MINUTES,
  COLD_STARTS_WINDOW_MS,
  evaluateIncidents,
  isFailedCheck,
  serviceStatusAfterCheck,
} from './incidents';
import type { CheckStatus } from './incidents';

const BASELINE_SAMPLES = 20;

@Injectable()
export class CheckRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly probe: EndpointProbe,
    private readonly notifications: NotificationsService,
  ) {}

  async run(job: CheckJob) {
    const [target] = await this.database.db
      .select({ endpoint: services.endpoint, isEnabled: services.isEnabled })
      .from(services)
      .where(eq(services.id, job.serviceId))
      .limit(1);
    if (!target?.isEnabled) return null;

    const result = await this.probe.probe(target.endpoint);

    return this.database.sqlTransaction(async (client, tx) => {
      const [current] = await tx
        .select({ endpoint: services.endpoint, isEnabled: services.isEnabled })
        .from(services)
        .where(eq(services.id, job.serviceId))
        .for('update');
      if (!current?.isEnabled || current.endpoint !== target.endpoint) {
        return null;
      }

      const events: ServiceEvent[] = [];
      let status: CheckStatus = classify(result);
      const coldStart =
        status === 'warm' && result.latencyMs !== null
          ? detectColdStart(
              result.latencyMs,
              await this.recentWarmLatencies(tx, job.serviceId),
            )
          : null;
      if (coldStart) status = 'cold';

      const [check] = await tx
        .insert(readinessChecks)
        .values({
          serviceId: job.serviceId,
          status,
          coldStartSuspected: coldStart !== null,
          ...result,
        })
        .returning();

      if (coldStart && result.latencyMs !== null) {
        await tx.insert(coldStartEvents).values({
          serviceId: job.serviceId,
          readinessCheckId: check.id,
          baselineLatencyMs: coldStart.baselineMs,
          observedLatencyMs: result.latencyMs,
          detectedAt: check.checkedAt,
        });
      }

      const isFailure = isFailedCheck(status);
      const [state] = await tx
        .update(services)
        .set({
          lastCheckedAt: check.checkedAt,
          consecutiveFailures: isFailure
            ? sql`${services.consecutiveFailures} + 1`
            : 0,
        })
        .where(eq(services.id, job.serviceId))
        .returning({
          consecutiveFailures: services.consecutiveFailures,
          downNotifiedAt: services.downNotifiedAt,
          coldStartsNotifiedAt: services.coldStartsNotifiedAt,
        });

      const outcome = evaluateIncidents({
        ...state,
        isFailure,
        recentColdStarts: coldStart
          ? await this.recentColdStarts(tx, job.serviceId, check.checkedAt)
          : null,
        now: check.checkedAt,
      });
      const serviceStatus = serviceStatusAfterCheck(
        status,
        state.consecutiveFailures,
      );
      await tx
        .update(services)
        .set({ status: serviceStatus, ...outcome.updates })
        .where(eq(services.id, job.serviceId));

      const { serviceId } = job;
      const occurredAt = check.checkedAt.toISOString();
      if (outcome.wentDown) {
        events.push({
          type: 'service.down',
          serviceId,
          checkId: check.id,
          failureCount: state.consecutiveFailures,
          occurredAt,
        });
      }
      if (outcome.recoveredFrom) {
        events.push({
          type: 'service.recovered',
          serviceId,
          checkId: check.id,
          reportedDownAt: outcome.recoveredFrom.toISOString(),
          occurredAt,
        });
      }
      if (outcome.coldStarts) {
        events.push({
          type: 'service.cold_starts',
          serviceId,
          count: outcome.coldStarts,
          windowMinutes: COLD_STARTS_WINDOW_MINUTES,
          occurredAt,
        });
      }

      // The check, incident marker, and queue jobs commit together. A queueing
      // failure rolls everything back so the check job can retry safely.
      await this.notifications.publish(events, {
        executeSql: (text, values) => client.query(text, values),
      });
      return check;
    });
  }

  private async recentColdStarts(
    tx: AppDatabase,
    serviceId: string,
    now: Date,
  ) {
    const [{ total }] = await tx
      .select({ total: count() })
      .from(coldStartEvents)
      .where(
        and(
          eq(coldStartEvents.serviceId, serviceId),
          gt(
            coldStartEvents.detectedAt,
            new Date(now.getTime() - COLD_STARTS_WINDOW_MS),
          ),
        ),
      );
    return total;
  }

  private async recentWarmLatencies(tx: AppDatabase, serviceId: string) {
    const rows = await tx
      .select({ latencyMs: readinessChecks.latencyMs })
      .from(readinessChecks)
      .where(
        and(
          eq(readinessChecks.serviceId, serviceId),
          eq(readinessChecks.status, 'warm'),
          isNotNull(readinessChecks.latencyMs),
        ),
      )
      .orderBy(desc(readinessChecks.checkedAt))
      .limit(BASELINE_SAMPLES);
    return rows.map((row) => row.latencyMs!);
  }
}
