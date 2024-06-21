import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { DatabaseModule } from '../database/database.module';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { BadRequestException } from '@nestjs/common';
import { UserPointRepository } from './repository/user-point.repository';
import { PointHistoryRepository } from './repository/point-history.repository';
import { QueueTable } from '../database/queue.table';

describe('PointService', () => {
  let service: PointService;

  // Mocking UserPointRepository
  const mockUserPointTable: Map<number, UserPoint> = new Map();
  const mockUserPointRepository = {
    findOne: jest.fn((id) =>
      Promise.resolve(
        mockUserPointTable.get(id) ?? {
          id,
          point: 0,
          updateMillis: Date.now(),
        },
      ),
    ),
    upsert: jest.fn((id, amount) => {
      const userPoint = {
        id: id,
        point: amount,
        updateMillis: Date.now(),
      };
      mockUserPointTable.set(id, userPoint);
      return Promise.resolve(userPoint);
    }),
  };

  // Mocking PointHistoryRepository
  const mockPointHistoryTable: PointHistory[] = [];
  const mockPointHistoryRepository = {
    insert: jest.fn(
      (
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
      ) => {
        const data = {
          id: Date.now(),
          userId: userId,
          amount: amount,
          type: transactionType,
          timeMillis: updateMillis,
        };
        mockPointHistoryTable.push(data);
        return Promise.resolve(data);
      },
    ),
    find: jest.fn((id) =>
      Promise.resolve(mockPointHistoryTable.filter((v) => v.userId == id)),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        PointService,
        {
          provide: UserPointRepository,
          useValue: mockUserPointRepository,
        },
        {
          provide: PointHistoryRepository,
          useValue: mockPointHistoryRepository,
        },
        QueueTable,
      ],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 포인트 조회
  describe('특정 유저의 포인트를 조회하는 기능', () => {
    // 성공 케이스
    it('성공 케이스', () => {
      const userId = 1;
      expect(service.point(userId)).resolves.toEqual({
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
      expect(service.history(userId)).resolves.toEqual(
        expect.any(Array<PointHistory>),
      );
    });
  });

  // 포인트 충전
  describe('특정 유저의 포인트를 충전하는 기능', () => {
    // 성공 케이스
    it('포인트를 충전하고 기록이 생성되는지 테스트', async () => {
      const userId = 1;
      const dto = {
        amount: 100,
      };

      await service.charge(userId, dto);
      const history = await service.history(userId);
      const lastHistory = history[history.length - 1];

      expect(lastHistory).toEqual({
        id: expect.any(Number),
        userId: userId,
        amount: dto.amount,
        type: TransactionType.CHARGE,
        timeMillis: expect.any(Number),
      });
    });

    /**
     * request에 대한 validation
     * 1. 포인트의 값이 양의 정수가 아닌 경우에 대한 Error 반환 테스트
     */
    it('포인트가 음수인 경우', () => {
      const userId = 1;
      const dto = {
        amount: -100,
      };

      expect(service.charge(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('포인트가 0인 경우', () => {
      const userId = 1;
      const dto = {
        amount: 0,
      };

      expect(service.charge(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  // 포인트 사용
  describe('특정 유저의 포인트를 사용하는 기능', () => {
    // 성공 케이스
    it('포인트를 사용하고 기록이 생성되는지 테스트', async () => {
      const userId = 1;
      const dto = {
        amount: 100,
      };

      await service.charge(userId, dto);
      await service.use(userId, dto);
      const history = await service.history(userId);
      const lastHistory = history[history.length - 1];

      expect(lastHistory).toEqual({
        id: expect.any(Number),
        userId: userId,
        amount: dto.amount,
        type: TransactionType.USE,
        timeMillis: expect.any(Number),
      });
    });

    /**
     * request에 대한 validation
     * 1. 포인트의 값이 양의 정수가 아닌 경우에 대한 Error 반환 테스트
     * 2. 현재 충전된 포인트보다 높은 값의 포인트를 사용하는 경우
     */
    it('포인트가 음수인 경우', () => {
      const userId = 1;
      const dto = {
        amount: -100,
      };

      expect(service.use(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('포인트가 0인 경우', () => {
      const userId = 1;
      const dto = {
        amount: 0,
      };

      expect(service.use(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('포인트가 현재 포인트보다 높은 경우', () => {
      const userId = 1;
      const dto = {
        amount: 0,
      };

      expect(service.use(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });
});
