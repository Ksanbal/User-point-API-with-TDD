import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { DatabaseModule } from '../database/database.module';
import { PointHistory } from './point.model';
import { BadRequestException } from '@nestjs/common';

describe('PointController', () => {
  let pointController: PointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PointController],
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
     * request에 대한 validation
     * 1. 포인트의 값이 양의 정수가 아닌 경우에 대한 Error 반환 테스트
     */
    it('포인트가 음수인 경우', () => {
      const userId = 1;
      const dto = {
        amount: -100,
      };

      expect(pointController.charge(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('포인트가 0인 경우', () => {
      const userId = 1;
      const dto = {
        amount: 0,
      };

      expect(pointController.charge(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // 포인트 사용
  describe('특정 유저의 포인트를 사용하는 기능', () => {
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
     * request에 대한 validation
     * 1. 포인트의 값이 양의 정수가 아닌 경우에 대한 Error 반환 테스트
     */
    it('포인트가 음수인 경우', () => {
      const userId = 1;
      const dto = {
        amount: -100,
      };

      expect(pointController.use(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('포인트가 0인 경우', () => {
      const userId = 1;
      const dto = {
        amount: 0,
      };

      expect(pointController.use(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
