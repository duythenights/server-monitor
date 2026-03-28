/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mock<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<Mocked<UsersService>>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = {} as any;
    usersService.create.mockResolvedValue(user);

    const createUserDto = {
      name: 'test',
      email: 'test@test.com',
    };
    const result = await controller.create(createUserDto);
    expect(usersService.create).toHaveBeenCalledTimes(1);
    expect(usersService.create).toHaveBeenCalledWith(createUserDto);

    expect(result).toEqual(user);
  });
});
