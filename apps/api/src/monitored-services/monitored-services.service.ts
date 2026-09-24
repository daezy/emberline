import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';

import { DatabaseService, services } from '../database';
import { isUniqueViolation } from '../database/errors';
import { ProjectsService } from '../projects';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class MonitoredServicesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly projects: ProjectsService,
  ) {}

  async list(userId: string, projectId?: string) {
    if (projectId) {
      await this.projects.get(userId, projectId);
    }

    return this.database.db
      .select()
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
      .select()
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

    const [service] = await this.database.db
      .insert(services)
      .values({ ...dto, userId, projectId })
      .onConflictDoNothing()
      .returning();
    if (!service) {
      throw new ConflictException('You already track this endpoint');
    }
    return service;
  }

  async update(userId: string, id: string, dto: UpdateServiceDto) {
    await this.get(userId, id);
    if (dto.projectId) {
      await this.projects.get(userId, dto.projectId);
    }

    try {
      const [service] = await this.database.db
        .update(services)
        .set(dto)
        .where(and(eq(services.id, id), eq(services.userId, userId)))
        .returning();
      return service;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('You already track this endpoint');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);

    await this.database.db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)));
  }
}
