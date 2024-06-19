import { BadRequestException, Injectable } from '@nestjs/common';
import { PointHistoryTable } from '../database/pointhistory.table';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { PointBody as PointDto } from './point.dto';

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  /**
   * 특정 유저의 포인트를 조회하는 기능
   * @param id 유저 id
   * @returns Promise<UserPoint>
   */
  async point(id: number): Promise<UserPoint> {
    return await this.userDb.selectById(id);
  }

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회하는 기능
   * @param id 유저 id
   * @returns Promise<PointHistory[]>
   */
  async history(id: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(id);
  }

  /**
   * 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   * @param id 유저 id
   * @param pointDto body
   * @returns Promise<UserPoint>
   */
  async charge(id: number, pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;
    this.amountValidator(amount);

    const user = await this.userDb.selectById(id);

    await this.historyDb.insert(id, amount, TransactionType.CHARGE, Date.now());

    user.point += amount;
    return await this.userDb.insertOrUpdate(id, user.point);
  }

  /**
   * 특정 유저의 포인트를 사용하는 기능
   * @param id 유저 id
   * @param pointDto body
   * @returns Promise<UserPoint>
   */
  async use(id: number, pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;
    this.amountValidator(amount);

    const user = await this.userDb.selectById(id);

    if (user.point < amount) {
      throw new BadRequestException('');
    }

    await this.historyDb.insert(id, amount, TransactionType.CHARGE, Date.now());

    user.point -= amount;

    return await this.userDb.insertOrUpdate(id, user.point);
  }

  // ---------- Private ---------- //
  /**
   * amount가 유효한 값인지 확인하는 함수
   * @param amount
   */
  private amountValidator(amount: number): void {
    if (Number.isInteger(amount) && 0 < amount) return;

    throw new BadRequestException('올바르지 않은 입력값입니다.');
  }
}
