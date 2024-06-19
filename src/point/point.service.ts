import { BadRequestException, Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { PointBody as PointDto } from './point.dto';
import { UserPointRepository } from './repository/user-point.repository';
import { PointHistoryRepository } from './repository/point-history.repository';

@Injectable()
export class PointService {
  constructor(
    private readonly userPointRepository: UserPointRepository,
    private readonly pointHistoryRepository: PointHistoryRepository,
  ) {}

  /**
   * 특정 유저의 포인트를 조회하는 기능
   * @param id 유저 id
   * @returns Promise<UserPoint>
   */
  async point(id: number): Promise<UserPoint> {
    return await this.userPointRepository.findOne(id);
  }

  /**
   * 특정 유저의 포인트 충전/이용 내역을 조회하는 기능
   * @param id 유저 id
   * @returns Promise<PointHistory[]>
   */
  async history(id: number): Promise<PointHistory[]> {
    return await this.pointHistoryRepository.find(id);
  }

  /**
   * 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   * @param id 유저 id
   * @param pointDto body
   * @returns Promise<UserPoint>
   */
  async charge(id: number, pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;
    this.validateAmount(amount);

    const user = await this.userPointRepository.findOne(id);

    return await this.updatePointNInsertHistory(
      user,
      amount,
      TransactionType.CHARGE,
    );
  }

  /**
   * 특정 유저의 포인트를 사용하는 기능
   * @param id 유저 id
   * @param pointDto body
   * @returns Promise<UserPoint>
   */
  async use(id: number, pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;
    this.validateAmount(amount);

    const user = await this.userPointRepository.findOne(id);

    this.validateUserPointStatus(user.point, amount);

    return await this.updatePointNInsertHistory(
      user,
      amount,
      TransactionType.USE,
    );
  }

  // ---------- Private ---------- //
  /**
   * amount가 유효한 값인지 확인하는 함수
   * @param amount
   */
  private validateAmount(amount: number): void {
    if (Number.isInteger(amount) && 0 < amount) return;

    throw new BadRequestException('올바르지 않은 입력값입니다.');
  }

  private validateUserPointStatus(point: number, amount: number) {
    if (point < amount) {
      throw new BadRequestException('포인트가 부족합니다.');
    }
  }

  /**
   * 유저의 포인트 정보를 업데이트하고
   * @param user UserPoint
   * @param amount 충전/사용 하려는 포인트양
   * @param transactionType 충전/사용 여부
   * @returns Promise<UserPoint>
   */
  private async updatePointNInsertHistory(
    user: UserPoint,
    amount: number,
    transactionType: TransactionType,
  ) {
    if (transactionType == TransactionType.CHARGE) {
      user.point += amount;
    } else {
      user.point -= amount;
    }
    const result = await this.userPointRepository.upsert(user.id, user.point);

    await this.pointHistoryRepository.insert(
      user.id,
      amount,
      transactionType,
      Date.now(),
    );

    return result;
  }
}
