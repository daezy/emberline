import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService, services } from '../database';
import { isUniqueViolation } from '../database/errors';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class MonitoredServicesService {
  constructor(private readonly database: DatabaseService) {}

  list(userId: string) {
    return this.database.db
      .select()
      .from(services)
      .where(eq(services.userId, userId));
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

  async create(userId: string, dto: CreateServiceDto) {
    const [service] = await this.database.db
      .insert(services)
      .values({ ...dto, userId })
      .onConflictDoNothing()
      .returning();
    if (!service) {
      throw new ConflictException('You already track this endpoint');
    }
    return service;
  }

  async update(userId: string, id: string, dto: UpdateServiceDto) {
    await this.get(userId, id);

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
