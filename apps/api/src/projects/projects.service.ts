import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq } from 'drizzle-orm';

import { DatabaseService, isUniqueViolation, projects } from '../database';
import type { AppDatabase, AppTransaction } from '../database';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const DEFAULT_PROJECT_NAME = 'Default';

@Injectable()
export class ProjectsService {
  constructor(private readonly database: DatabaseService) {}

  list(userId: string) {
    return this.database.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(asc(projects.createdAt));
  }

  async get(userId: string, id: string) {
    const [project] = await this.database.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const [project] = await this.database.db
      .insert(projects)
      .values({ ...dto, userId })
      .onConflictDoNothing()
      .returning();
    if (!project) {
      throw new ConflictException('You already have a project with this name');
    }
    return project;
  }

  async createDefault(db: AppDatabase | AppTransaction, userId: string) {
    const [project] = await db
      .insert(projects)
      .values({ userId, name: DEFAULT_PROJECT_NAME })
      .returning();
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.get(userId, id);

    try {
      const [project] = await this.database.db
        .update(projects)
        .set(dto)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning();
      return project;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'You already have a project with this name',
        );
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);

    const [{ total }] = await this.database.db
      .select({ total: count() })
      .from(projects)
      .where(eq(projects.userId, userId));
    if (total <= 1) {
      throw new ConflictException('You need at least one project');
    }

    await this.database.db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  }
}
