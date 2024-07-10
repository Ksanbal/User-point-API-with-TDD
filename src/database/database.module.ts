import { Module } from '@nestjs/common';
import { PointHistoryTable } from './pointhistory.table';
import { UserPointTable } from './userpoint.table';
import { QueueTable } from './queue.table';

@Module({
  providers: [UserPointTable, PointHistoryTable, QueueTable],
  exports: [UserPointTable, PointHistoryTable, QueueTable],
})
export class DatabaseModule {}
