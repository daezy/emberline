import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';

import { DatabaseService, services, warmPolicies } from '../database';
import { isUniqueViolation } from '../database/errors';
import { DEFAULT_INTERVAL_MINUTES } from '../monitoring/scheduling/warm-schedule';
import { ProjectsService } from '../projects';
import { CheckQueue } from '../queue';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

const publicServiceFields = {
  id: services.id,
  projectId: services.projectId,
  name: services.name,
  endpoint: services.endpoint,
  status: services.status,
  isEnabled: services.isEnabled,
  lastCheckedAt: services.lastCheckedAt,
  createdAt: services.createdAt,
  updatedAt: services.updatedAt,
};

@Injectable()
export class MonitoredServicesService {
  private readonly logger = new Logger(MonitoredServicesService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly projects: ProjectsService,
    private readonly checks: CheckQueue,
  ) {}

  async list(userId: string, projectId?: string) {
    if (projectId) {
      await this.projects.get(userId, projectId);
    }

    return this.database.db
      .select(publicServiceFields)
      .from(services)
      .where(
        and(
          eq(services.userId, userId),
          projectId ? eq(services.projectId, projectId) : undefined,
        ),
      )
      .orderBy(asc(services.createdAt));
  }

  async get(userId: string, id: string) {
    const [service] = await this.database.db
      .select(publicServiceFields)
      .from(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)))
      .limit(1);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(userId: string, projectId: string, dto: CreateServiceDto) {
    await this.projects.get(userId, projectId);

    const service = await this.database.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(services)
        .values({ ...dto, userId, projectId })
        .onConflictDoNothing()
        .returning(publicServiceFields);
      if (created) {
        await tx.insert(warmPolicies).values({
          serviceId: created.id,
          intervalMinutes: DEFAULT_INTERVAL_MINUTES,
          nextWarmAt: new Date(Date.now() + DEFAULT_INTERVAL_MINUTES * 60_000),
        });
      }
      return created;
    });
    if (!service) {
      throw new ConflictException('You already track this endpoint');
    }

    await this.scheduleImmediateCheck(service);
    return service;
  }

  async update(userId: string, id: string, dto: UpdateServiceDto) {
    if (dto.projectId) {
      await this.projects.get(userId, dto.projectId);
    }

    try {
      const resets =
        dto.endpoint !== undefined || dto.isEnabled !== undefined
          ? {
              consecutiveFailures: 0,
              downNotifiedAt: null,
              coldStartsNotifiedAt: null,
            }
          : {};
      const [service] = await this.database.db
        .update(services)
        .set({
          ...dto,
          ...resets,
          ...(dto.isEnabled === true ? { status: 'cold' as const } : {}),
        })
        .where(and(eq(services.id, id), eq(services.userId, userId)))
        .returning(publicServiceFields);
      if (!service) {
        throw new NotFoundException('Service not found');
      }
      if (dto.endpoint !== undefined || dto.isEnabled === true) {
        await this.scheduleImmediateCheck(service);
      }
      return service;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('You already track this endpoint');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const [deleted] = await this.database.db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)))
      .returning({ id: services.id });
    if (!deleted) {
      throw new NotFoundException('Service not found');
    }
  }

  private async scheduleImmediateCheck(service: {
    id: string;
    isEnabled: boolean;
  }) {
    if (!service.isEnabled) return;

    // If queueing fails, make the policy due so the scheduler retries it.
    await this.checks
      .enqueue([{ serviceId: service.id }])
      .catch(async (error) => {
        this.logger.warn('Queueing immediate check failed', error);
        await this.database.db
          .update(warmPolicies)
          .set({ nextWarmAt: new Date() })
          .where(eq(warmPolicies.serviceId, service.id));
      });
  }
}
