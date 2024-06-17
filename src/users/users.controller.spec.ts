import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  // Controller를 Unit 테스트하기 위해서 Service를 Mocking
  const mockUsersService = {
    create: jest.fn((dto) => {
      return {
        id: Date.now(),
        ...dto,
      };
    }),
    findAll: jest.fn(() => [
      {
        id: 1,
        name: '노윤서',
      },
    ]),
    findOne: jest.fn((id) => ({
      id,
      name: '노윤서',
    })),
    update: jest.fn().mockImplementation((id, dto) => ({
      id,
      ...dto,
    })),
    remove: jest.fn((id) => ({
      id,
      name: '노윤서',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // User 생성 테스트
  it('should create a user', () => {
    const dto = { name: '노윤서' };

    expect(controller.create(dto)).toEqual({
      id: expect.any(Number),
      name: dto.name,
    });

    // mocking된 Service의 create 함수가 dto를 인자로 호출되었는지 확인
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  // User 목록 조회 테스트
  it('should return an array of users', () => {
    expect(controller.findAll()).toEqual([
      {
        id: 1,
        name: '노윤서',
      },
    ]);

    // 단순하게 findAll 함수가 호출되었는지 확인
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  // User 조회 테스트
  it('should return a user', () => {
    expect(controller.findOne('1')).toEqual({
      id: 1,
      name: '노윤서',
    });

    expect(mockUsersService.findOne).toHaveBeenCalled();
  });

  // User 업데이트 테스트
  it('should update a user', () => {
    const dto = { name: '노윤서' };

    expect(controller.update('1', dto)).toEqual({
      id: 1,
      ...dto,
    });

    expect(mockUsersService.update).toHaveBeenCalled();
  });

  // User 삭제 테스트
  it('should remove a user', () => {
    expect(controller.remove('1')).toEqual({
      id: 1,
      name: '노윤서',
    });

    expect(mockUsersService.remove).toHaveBeenCalled();
  });
});
