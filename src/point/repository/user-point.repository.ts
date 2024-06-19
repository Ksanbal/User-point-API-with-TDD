import { Injectable } from '@nestjs/common';
import { UserPointTable } from '../../database/userpoint.table';
import { UserPoint } from '../point.model';

@Injectable()
export class UserPointRepository {
  constructor(private readonly userDb: UserPointTable) {}

  /**
   * id로 유저 정보 조회
   * @param id 유저 id
   * @returns Promise<UserPoint>
   */
  async getOne(id: number): Promise<UserPoint> {
    return this.userDb.selectById(id);
  }

  /**
   * 유저의 정보를 업데이트 하거나 새로 생성
   * @param id 유저 id
   * @param amount 업데이트할 point
   * @returns Promise<UserPoint>
   */
  async upsert(id: number, amount: number): Promise<UserPoint> {
    return this.userDb.insertOrUpdate(id, amount);
  }
}
