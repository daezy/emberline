import { Module } from '@nestjs/common';

import { CheckQueue } from './check-queue';
import { PgBossService } from './pg-boss.service';

@Module({
  providers: [PgBossService, CheckQueue],
  exports: [PgBossService, CheckQueue],
})
export class QueueModule {}
