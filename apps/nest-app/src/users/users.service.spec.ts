import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mock<Repository<UserEntity>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Mocked<Repository<UserEntity>>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    repository.create.mockReturnValue(user);
    repository.save.mockResolvedValue(user);
    const createUserDto = {
      name: 'test',
      email: 'test@test.com',
    };
    const result = await service.create(createUserDto);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(createUserDto);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should find all users', async () => {
    const users = [
      {
        id: '1',
        name: 'test',
        email: 'test@test.com',
      },
    ];
    repository.find.mockResolvedValue(users);
    const result = await service.findAll();
    expect(repository.find).toHaveBeenCalledTimes(1);
    expect(repository.find).toHaveBeenCalledWith();
    expect(result).toEqual(users);
  });

  it('should find a user by id', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    repository.findOneBy.mockResolvedValue(user);
    const result = await service.findOne('1');
    expect(repository.findOneBy).toHaveBeenCalledTimes(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    repository.findOneBy.mockResolvedValue(user);
    repository.save.mockResolvedValue(user);
    const updateUserDto = {
      name: 'test',
      email: 'test@test.com',
    };
    const result = await service.update('1', updateUserDto);
    expect(repository.findOneBy).toHaveBeenCalledTimes(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith({ ...user, ...updateUserDto });
    expect(result).toEqual(user);
  });

  it('should delete a user', async () => {
    const user = {
      id: '1',
      name: 'test',
      email: 'test@test.com',
    };
    repository.findOneBy.mockResolvedValue(user);
    repository.remove.mockResolvedValue(user);
    const result = await service.remove('1');
    expect(repository.findOneBy).toHaveBeenCalledTimes(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(repository.remove).toHaveBeenCalledTimes(1);
    expect(repository.remove).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should throw an error if the user is not found', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });

  it('should throw an error if the user is not found when updating', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(
      service.update('1', { name: 'test', email: 'test@test.com' }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should throw an error if the user is not found when deleting', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.remove('1')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });
});
