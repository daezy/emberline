import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService, warmPolicies } from '../../database';
import { UpdatePolicyDto } from '../dto/update-policy.dto';
import { parseTime } from './warm-schedule';

const publicPolicyFields = {
  id: warmPolicies.id,
  serviceId: warmPolicies.serviceId,
  mode: warmPolicies.mode,
  intervalMinutes: warmPolicies.intervalMinutes,
  timezone: warmPolicies.timezone,
  schedule: warmPolicies.schedule,
  nextWarmAt: warmPolicies.nextWarmAt,
};

@Injectable()
export class WarmPoliciesService {
  constructor(private readonly database: DatabaseService) {}

  async get(serviceId: string) {
    const [policy] = await this.database.db
      .select(publicPolicyFields)
      .from(warmPolicies)
      .where(eq(warmPolicies.serviceId, serviceId))
      .limit(1);
    if (!policy) {
      throw new NotFoundException('Warm policy not found');
    }
    return policy;
  }

  async update(serviceId: string, dto: UpdatePolicyDto) {
    const merged = { ...(await this.get(serviceId)), ...dto };

    if (merged.mode === 'schedule') {
      if (!merged.schedule) {
        throw new BadRequestException(
          'A schedule is required in schedule mode',
        );
      }
      if (
        parseTime(merged.schedule.startTime) >=
        parseTime(merged.schedule.endTime)
      ) {
        throw new BadRequestException('startTime must be before endTime');
      }
    }

    // Due now, so the scheduler applies the new settings on its next pass.
    const nextWarmAt = merged.mode === 'manual' ? null : new Date();

    const [policy] = await this.database.db
      .update(warmPolicies)
      .set({ ...dto, nextWarmAt, updatedAt: new Date() })
      .where(eq(warmPolicies.serviceId, serviceId))
      .returning(publicPolicyFields);
    return policy;
  }
}
