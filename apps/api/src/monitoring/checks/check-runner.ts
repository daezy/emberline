import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNotNull } from 'drizzle-orm';

import {
  DatabaseService,
  coldStartEvents,
  isForeignKeyViolation,
  readinessChecks,
  services,
} from '../../database';
import type { AppTransaction } from '../../database';
import type { CheckJob } from '../../queue';
import { classify } from './classify';
import { detectColdStart } from './cold-start';
import { EndpointProbe } from '../probe/endpoint-probe';

const BASELINE_SAMPLES = 20;

type CheckStatus = (typeof readinessChecks.$inferInsert)['status'];

@Injectable()
export class CheckRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly probe: EndpointProbe,
  ) {}

  async run(job: CheckJob) {
    const result = await this.probe.probe(job.endpoint);

    try {
      return await this.database.db.transaction(async (tx) => {
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

        await tx
          .update(services)
          .set({ status, lastCheckedAt: check.checkedAt })
          .where(eq(services.id, job.serviceId));
        return check;
      });
    } catch (error) {
      // The service was deleted while its check was in flight.
      if (isForeignKeyViolation(error)) return null;
      throw error;
    }
  }

  private async recentWarmLatencies(tx: AppTransaction, serviceId: string) {
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
