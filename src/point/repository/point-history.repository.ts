import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from '../../database/pointhistory.table';
import { PointHistory, TransactionType } from '../point.model';

@Injectable()
export class PointHistoryRepository {
  constructor(private readonly historyDb: PointHistoryTable) {}

  /**
   * 새로운 포인트 기록을 생성
   * @param id 유저 id
   * @returns Promise<PointHistory>
   */
  async insert(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    updateMillis: number,
  ): Promise<PointHistory> {
    return this.historyDb.insert(userId, amount, transactionType, updateMillis);
  }

  /**
   * 유저의 기록 목록 조회
   * @param id 유저 id
   * @returns Promise<PointHistory[]>
   */
  async find(id: number): Promise<PointHistory[]> {
    return this.historyDb.selectAllByUserId(id);
  }
}
