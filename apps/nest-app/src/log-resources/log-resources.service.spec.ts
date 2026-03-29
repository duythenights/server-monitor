import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LogResourceEntity,
  LogSourseStatus,
  LogSourseType,
} from './entities/log-resource.entity';
import { LogResourcesService } from './log-resources.service';

function sampleLogResource(
  overrides: Partial<LogResourceEntity> = {},
): LogResourceEntity {
  const now = new Date();
  return {
    id: 'log-id',
    ownerId: 'owner-1',
    name: 'log-a',
    status: LogSourseStatus.UNKNOWN,
    type: LogSourseType.ZABBIX,
    config: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as LogResourceEntity;
}

describe('LogResourcesService', () => {
  let service: LogResourcesService;
  let repository: Mocked<Repository<LogResourceEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(LogResourceEntity),
          useValue: mock<Repository<LogResourceEntity>>(),
        },
        LogResourcesService,
      ],
    }).compile();
    service = module.get<LogResourcesService>(LogResourcesService);
    repository = module.get<Mocked<Repository<LogResourceEntity>>>(
      getRepositoryToken(LogResourceEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should merge ownerId and default status then save', async () => {
      const dto = {
        name: 'metrics',
        type: LogSourseType.PROMETHEUS,
        config: { url: 'http://localhost' },
      };
      const ownerId = 'owner-uuid';
      const now = new Date();
      const entityFromCreate = {
        id: 'new-id',
        ...dto,
        ownerId,
        status: LogSourseStatus.UNKNOWN,
        createdAt: now,
        updatedAt: now,
      } as LogResourceEntity;
      const entityFromSave = { ...entityFromCreate } as LogResourceEntity;

      repository.create.mockReturnValue(entityFromCreate);
      repository.save.mockResolvedValue(entityFromSave);

      const result = await service.create(dto, ownerId);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        ownerId,
        status: LogSourseStatus.UNKNOWN,
      });
      expect(repository.save).toHaveBeenCalledWith(entityFromCreate);
      expect(result).toEqual(entityFromSave);
    });
  });

  describe('findAll', () => {
    it('should return log resources for the owner', async () => {
      const ownerId = 'owner-1';
      const list = [
        sampleLogResource(),
        sampleLogResource({ id: 'other', name: 'b' }),
      ];
      repository.find.mockResolvedValue(list);

      const result = await service.findAll(ownerId);

      expect(repository.find).toHaveBeenCalledWith({ where: { ownerId } });
      expect(result).toEqual(list);
    });
  });

  describe('findById', () => {
    it('should query by id and ownerId', async () => {
      const entity = sampleLogResource({ id: 'x', ownerId: 'o1' });
      repository.findOneBy.mockResolvedValue(entity);

      const result = await service.findById('x', 'o1');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'x',
        ownerId: 'o1',
      });
      expect(result).toEqual(entity);
    });

    it('should return null when no row matches', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('x', 'o1');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should delegate to findById', async () => {
      const entity = sampleLogResource({ id: 'x' });
      repository.findOneBy.mockResolvedValue(entity);

      const result = await service.findOne('x', 'owner-1');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'x',
        ownerId: 'owner-1',
      });
      expect(result).toEqual(entity);
    });
  });

  describe('update', () => {
    it('should merge dto and save when the row exists', async () => {
      const existing = sampleLogResource({ id: 'x', name: 'old' });
      const updated = { ...existing, name: 'new' } as LogResourceEntity;
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockResolvedValue(updated);

      const result = await service.update('x', 'owner-1', { name: 'new' });

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'x',
        ownerId: 'owner-1',
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...existing,
        name: 'new',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when the row does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('missing', 'owner-1', { name: 'n' }),
      ).rejects.toThrow(new NotFoundException('Log resource not found'));

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove when the row exists', async () => {
      const entity = sampleLogResource({ id: 'x' });
      repository.findOneBy.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(entity);

      const result = await service.remove('x', 'owner-1');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'x',
        ownerId: 'owner-1',
      });
      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('should throw NotFoundException when the row does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing', 'owner-1')).rejects.toThrow(
        new NotFoundException('Log resource not found'),
      );

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
