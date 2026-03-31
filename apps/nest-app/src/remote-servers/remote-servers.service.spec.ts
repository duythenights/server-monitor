import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RemoteServerEntity,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { RemoteServersService } from './remote-servers.service';
import { REMOTE_SERVERS_LIMIT } from './remote-servers.constants';

function sampleRemoteServer(
  overrides: Partial<RemoteServerEntity> = {},
): RemoteServerEntity {
  const now = new Date();
  return {
    id: 'server-id',
    name: 'srv',
    ownerId: 'owner-1',
    config: {},
    status: RemoteServerStatus.UNKNOWN,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as RemoteServerEntity;
}

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repository: Mocked<Repository<RemoteServerEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteServersService,
        {
          provide: getRepositoryToken(RemoteServerEntity),
          useValue: mock<Repository<RemoteServerEntity>>(),
        },
      ],
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);
    repository = module.get<Mocked<Repository<RemoteServerEntity>>>(
      getRepositoryToken(RemoteServerEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should merge ownerId and default status then save', async () => {
      const props = {
        name: 'srv-1',
        config: { host: '10.0.0.1' },
      };
      const ownerId = 'owner-uuid';
      const now = new Date();
      const entityFromCreate = {
        id: 'new-id',
        ...props,
        ownerId,
        status: RemoteServerStatus.UNKNOWN,
        createdAt: now,
        updatedAt: now,
      } as RemoteServerEntity;
      const entityFromSave = { ...entityFromCreate } as RemoteServerEntity;

      repository.create.mockReturnValue(entityFromCreate);
      repository.save.mockResolvedValue(entityFromSave);

      const result = await service.create(props, ownerId);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith({
        ...props,
        ownerId,
        status: RemoteServerStatus.UNKNOWN,
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(entityFromCreate);
      expect(result).toEqual(entityFromSave);
    });
    it('should reject create when owner already has 3 remote servers', async () => {
      const ownerId = 'owner-1';
      const props = {
        name: 'srv-1',
        config: { host: '10.0.0.1' },
      };
      repository.count.mockResolvedValue(REMOTE_SERVERS_LIMIT);

      await expect(service.create(props, ownerId)).rejects.toThrow(
        new ConflictException('You have reached the limit of remote servers'),
      );

      expect(repository.count).toHaveBeenCalledWith({ where: { ownerId } });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should allow create when owner has fewer than 3 remote servers', async () => {
      const props = {
        name: 'srv-1',
        config: { host: '10.0.0.1' },
      };
      const ownerId = 'owner-1';
      const now = new Date();
      const entityFromCreate = {
        id: 'new-id',
        ...props,
        ownerId,
        status: RemoteServerStatus.UNKNOWN,
        createdAt: now,
        updatedAt: now,
      } as RemoteServerEntity;
      const entityFromSave = { ...entityFromCreate } as RemoteServerEntity;

      repository.count.mockResolvedValue(2);
      repository.create.mockReturnValue(entityFromCreate);
      repository.save.mockResolvedValue(entityFromSave);

      const result = await service.create(props, ownerId);

      expect(repository.count).toHaveBeenCalledWith({ where: { ownerId } });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(entityFromCreate);
      expect(result).toEqual(entityFromSave);
    });
  });

  describe('findAll', () => {
    it('should return only servers for the given ownerId', async () => {
      const ownerId = 'owner-1';
      const list = [sampleRemoteServer(), sampleRemoteServer({ id: 'b' })];
      repository.find.mockResolvedValue(list);

      const result = await service.findAll(ownerId);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({ where: { ownerId } });
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return the server when owned by caller', async () => {
      const entity = sampleRemoteServer({ id: 'x', ownerId: 'owner-1' });
      repository.findOneBy.mockResolvedValue(entity);

      const result = await service.findOne('x', 'owner-1');

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'x' });
      expect(result).toEqual(entity);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing', 'owner-1')).rejects.toThrow(
        new NotFoundException('Remote server not found'),
      );
    });

    it('should throw ForbiddenException when owner does not match', async () => {
      repository.findOneBy.mockResolvedValue(
        sampleRemoteServer({ id: 'x', ownerId: 'other-owner' }),
      );

      await expect(service.findOne('x', 'owner-1')).rejects.toThrow(
        new ForbiddenException('You are not the owner of this remote server'),
      );
    });
  });

  describe('update', () => {
    it('should merge dto and save when owned', async () => {
      const existing = sampleRemoteServer({
        id: 'x',
        name: 'old',
        ownerId: 'owner-1',
      });
      const updated = { ...existing, name: 'new' } as RemoteServerEntity;
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockResolvedValue(updated);

      const result = await service.update('x', 'owner-1', { name: 'new' });

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'x' });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith({
        ...existing,
        name: 'new',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('missing', 'owner-1', { name: 'n' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when owner does not match', async () => {
      repository.findOneBy.mockResolvedValue(
        sampleRemoteServer({ id: 'x', ownerId: 'other' }),
      );

      await expect(
        service.update('x', 'owner-1', { name: 'n' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove when owned', async () => {
      const entity = sampleRemoteServer({ id: 'x', ownerId: 'owner-1' });
      repository.findOneBy.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(entity);

      const result = await service.remove('x', 'owner-1');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'x' });
      expect(repository.remove).toHaveBeenCalledTimes(1);
      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when owner does not match', async () => {
      repository.findOneBy.mockResolvedValue(
        sampleRemoteServer({ id: 'x', ownerId: 'other' }),
      );

      await expect(service.remove('x', 'owner-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
