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

  it('should find all users', async () => {
    const users = [
      {
        id: '1',
        name: 'test',
        email: 'test@test.com',
      },
    ];
    usersService.findAll.mockResolvedValue(users);
    const result = await controller.findAll();
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
    expect(usersService.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(users);
  });

  it('should find a user by id', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    usersService.findOne.mockResolvedValue(user);
    const result = await controller.findOne('1');
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
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
  it('should update a user', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    usersService.update.mockResolvedValue(user);
    const updateUserDto = {
      name: 'test',
      email: 'test@test.com',
    };
    const result = await controller.update('1', updateUserDto);
    expect(usersService.update).toHaveBeenCalledTimes(1);
    expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto);
    expect(result).toEqual(user);
  });

  it('should delete a user', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    usersService.remove.mockResolvedValue(user);
    const result = await controller.remove('1');
    expect(usersService.remove).toHaveBeenCalledTimes(1);
    expect(usersService.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });
});
