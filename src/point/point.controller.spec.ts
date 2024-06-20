import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { DatabaseModule } from '../database/database.module';
import { PointHistory } from './point.model';
import { PointService } from './point.service';
import { UserPointRepository } from './repository/user-point.repository';
import { PointHistoryRepository } from './repository/point-history.repository';

describe('PointController', () => {
  let pointController: PointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PointController],
      providers: [PointService, UserPointRepository, PointHistoryRepository],
    }).compile();

    pointController = module.get<PointController>(PointController);
  });

  it('should be defined', () => {
    expect(pointController).toBeDefined();
  });

  // 포인트 조회
  describe('특정 유저의 포인트를 조회하는 기능', () => {
    // 성공 케이스
    it('성공 케이스', () => {
      const userId = 1;
      expect(pointController.point(userId)).resolves.toEqual({
        id: userId,
        point: 0,
        updateMillis: expect.any(Number),
      });
    });
  });

  // 포인트 내역 조회
  describe('특정 유저의 포인트 충전/이용 내역을 조회하는 기능', () => {
    // 성공 케이스
    it('성공 케이스', () => {
      const userId = 1;
      expect(pointController.history(userId)).resolves.toEqual(
        expect.any(Array<PointHistory>),
      );
    });
  });

  // 포인트 충전
  describe('특정 유저의 포인트를 충전하는 기능', () => {
    // 성공 케이스
    it('성공 케이스', () => {
      const userId = 1;
      const dto = {
        amount: 100,
      };

      expect(pointController.charge(userId, dto)).resolves.toEqual({
        id: userId,
        point: dto.amount,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * 동시성 제어에 대한 테스트
     * 1. 동시에 충전을 진행했을때 요청한 충전값이 모두 반영되는지 테스트
     */
    it('동시에 충전했을떄 성공적으로 처리되는 경우', async () => {
      const userPoint = await pointController.point(1);

      const requestDtos = [
        {
          amount: 100,
        },
        {
          amount: 200,
        },
        {
          amount: 300,
        },
      ];
      const totalAmount =
        userPoint.point + requestDtos.reduce((acc, cur) => acc + cur.amount, 0);

      const promises = requestDtos.map((dto) => pointController.charge(1, dto));
      await Promise.all(promises);

      const currentUserPoint = await pointController.point(1);
      expect(currentUserPoint.point).toEqual(totalAmount);
    });
  });

  // 포인트 사용
  describe('특정 유저의 포인트를 사용하는 기능', () => {
    // 성공 케이스
    it('성공 케이스', async () => {
      const userId = 1;
      const dto = {
        amount: 100,
      };

      // 포인트 사용을 위해 포인트 적립 적용
      await pointController.charge(userId, {
        amount: 200,
      });
      expect(pointController.use(userId, dto)).resolves.toEqual({
        id: userId,
        point: 100,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * 동시성 제어에 대한 테스트
     * 1. 두번의 요청이 동시에 들어왔을때 충전된 포인트보다 많은 포인트를 사용하려고 할때 2번째 요청은 실패해야한다.
     */
    it('동시에 사용했을때 이후의 요청이 거절되는 경우', async () => {
      // 사용자의 포인트를 100으로 초기 설정
      await pointController.charge(1, {
        amount: 300,
      });

      const requestDtos = [
        {
          amount: 200,
        },
        {
          amount: 200,
        },
      ];

      const promises = requestDtos.map((dto) => pointController.use(1, dto));
      await Promise.all(promises);

      const currentUserPoint = await pointController.point(1);
      expect(currentUserPoint.point).toEqual(100);
    });
  });
});
