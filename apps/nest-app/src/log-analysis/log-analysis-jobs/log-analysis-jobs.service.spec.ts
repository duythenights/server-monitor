import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogResourcesService } from '@/log-resources/log-resources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import {
  LogResourceEntity,
  LogSourseStatus,
  LogSourseType,
} from '@/log-resources/entities/log-resource.entity';
import {
  RemoteServerEntity,
  RemoteServerStatus,
} from '@/remote-servers/entities/remote-server.entity';
import {
  LogAnalysisJobEntity,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './entities/log-analysis-job.entity';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

function sampleLogResource(
  overrides: Partial<LogResourceEntity> = {},
): LogResourceEntity {
  const now = new Date();
  return {
    id: 'log-src-1',
    ownerId: 'owner-1',
    name: 'res',
    status: LogSourseStatus.UNKNOWN,
    type: LogSourseType.ZABBIX,
    config: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as LogResourceEntity;
}

function sampleRemoteServer(
  overrides: Partial<RemoteServerEntity> = {},
): RemoteServerEntity {
  const now = new Date();
  return {
    id: 'remote-1',
    ownerId: 'owner-1',
    name: 'srv',
    config: {},
    status: RemoteServerStatus.UNKNOWN,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as RemoteServerEntity;
}

function sampleJob(
  overrides: Partial<LogAnalysisJobEntity> = {},
): LogAnalysisJobEntity {
  const now = new Date();
  const logSource = sampleLogResource();
  const remoteServer = sampleRemoteServer();
  return {
    id: 'job-1',
    ownerId: 'owner-1',
    name: 'job',
    description: 'd',
    status: LogAnalysisJobStatus.INITIALIZED,
    type: LogAnalysisJobType.ONE_TIME,
    createdAt: now,
    updatedAt: now,
    logSource,
    remoteServer,
    ...overrides,
  } as LogAnalysisJobEntity;
}

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repository: Mocked<Repository<LogAnalysisJobEntity>>;
  let logResourcesService: Mocked<LogResourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJobEntity),
          useValue: mock<Repository<LogAnalysisJobEntity>>(),
        },
        {
          provide: LogResourcesService,
          useValue: mock<LogResourcesService>(),
        },
        {
          provide: RemoteServersService,
          useValue: mock<RemoteServersService>(),
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
    repository = module.get<Mocked<Repository<LogAnalysisJobEntity>>>(
      getRepositoryToken(LogAnalysisJobEntity),
    );
    logResourcesService =
      module.get<Mocked<LogResourcesService>>(LogResourcesService);
    remoteServersService =
      module.get<Mocked<RemoteServersService>>(RemoteServersService);
  });

  it('should be defined', () => {
    // Arrange — module compiled in beforeEach
    // Act — no call; service and mocks are retrieved in beforeEach
    // Assert
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should resolve log source and remote server then save job when logSourceId is provided', async () => {
      // Arrange
      const ownerId = 'owner-1';
      const logSource = sampleLogResource({ id: 'ls-1' });
      const remoteServer = sampleRemoteServer({ id: 'rs-1' });
      const props = {
        name: 'analysis-1',
        description: 'desc',
        type: LogAnalysisJobType.ONE_TIME,
        logSourceId: 'ls-1',
        remoteServerId: 'rs-1',
      };
      const created = sampleJob({
        ...props,
        id: 'new-job',
        logSource,
        remoteServer,
      });
      const saved = { ...created } as LogAnalysisJobEntity;
      logResourcesService.findOne.mockResolvedValue(logSource);
      remoteServersService.findOne.mockResolvedValue(remoteServer);
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(saved);

      // Act
      const result = await service.create(props, ownerId);

      // Assert
      expect(logResourcesService.findOne).toHaveBeenCalledWith('ls-1', ownerId);
      expect(remoteServersService.findOne).toHaveBeenCalledWith(
        'rs-1',
        ownerId,
      );
      expect(repository.create).toHaveBeenCalledWith({
        name: props.name,
        description: props.description,
        type: props.type,
        ownerId,
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource,
        remoteServer,
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });

    it('should skip log source lookup and save job without logSource when logSourceId is not provided', async () => {
      // Arrange
      const ownerId = 'owner-1';
      const remoteServer = sampleRemoteServer({ id: 'rs-1' });
      const props = {
        name: 'analysis-no-log-src',
        description: 'no log source',
        type: LogAnalysisJobType.ONE_TIME,
        remoteServerId: 'rs-1',
      };
      const created = sampleJob({
        ...props,
        id: 'new-job-2',
        logSource: undefined,
        remoteServer,
      });
      const saved = { ...created } as LogAnalysisJobEntity;
      remoteServersService.findOne.mockResolvedValue(remoteServer);
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(saved);

      // Act
      const result = await service.create(props, ownerId);

      // Assert — logResourcesService should NOT be called
      expect(logResourcesService.findOne).not.toHaveBeenCalled();
      expect(remoteServersService.findOne).toHaveBeenCalledWith(
        'rs-1',
        ownerId,
      );
      expect(repository.create).toHaveBeenCalledWith({
        name: props.name,
        description: props.description,
        type: props.type,
        ownerId,
        status: LogAnalysisJobStatus.INITIALIZED,
        remoteServer,
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });

    it('should throw when log source is not found', async () => {
      // Arrange
      logResourcesService.findOne.mockResolvedValue(null);

      // Act + Assert
      await expect(
        service.create(
          {
            name: 'j',
            type: LogAnalysisJobType.ONE_TIME,
            logSourceId: 'x',
            remoteServerId: 'y',
          },
          'owner-1',
        ),
      ).rejects.toThrow(new NotFoundException('Log source not found'));

      // Assert — side effects
      expect(remoteServersService.findOne).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw when remote server is not found', async () => {
      // Arrange
      logResourcesService.findOne.mockResolvedValue(sampleLogResource());
      remoteServersService.findOne.mockResolvedValue(
        null as unknown as RemoteServerEntity,
      );

      // Act + Assert
      await expect(
        service.create(
          {
            name: 'j',
            type: LogAnalysisJobType.ONE_TIME,
            logSourceId: 'ls',
            remoteServerId: 'rs',
          },
          'owner-1',
        ),
      ).rejects.toThrow(new NotFoundException('Remote server not found'));

      // Assert — side effects
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should list jobs for owner with relations', async () => {
      // Arrange
      const ownerId = 'owner-1';
      const list = [sampleJob({ id: 'a' }), sampleJob({ id: 'b' })];
      repository.find.mockResolvedValue(list);

      // Act
      const result = await service.findAll(ownerId);

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        where: { ownerId },
        relations: { logSource: true, remoteServer: true },
      });
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return job with relations when found', async () => {
      // Arrange
      const job = sampleJob({ id: 'x' });
      repository.findOne.mockResolvedValue(job);

      // Act
      const result = await service.findOne('x', 'owner-1');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'x', ownerId: 'owner-1' },
        relations: { logSource: true, remoteServer: true },
      });
      expect(result).toEqual(job);
    });
  });

  describe('update', () => {
    it('should merge dto and save when job exists', async () => {
      // Arrange
      const existing = sampleJob({ id: 'x', name: 'old' });
      const updated = { ...existing, name: 'new' } as LogAnalysisJobEntity;
      repository.findOne.mockResolvedValue(existing);
      repository.save.mockResolvedValue(updated);

      // Act
      const result = await service.update('x', 'owner-1', { name: 'new' });

      // Assert
      expect(repository.save).toHaveBeenCalledWith({
        ...existing,
        name: 'new',
      });
      expect(result).toEqual(updated);
    });

    it('should throw when job is not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act + Assert
      await expect(
        service.update('missing', 'owner-1', { name: 'n' }),
      ).rejects.toThrow(new NotFoundException('Log analysis job not found'));

      // Assert — side effects
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove when job exists', async () => {
      // Arrange
      const job = sampleJob({ id: 'x' });
      repository.findOne.mockResolvedValue(job);
      repository.remove.mockResolvedValue(job);

      // Act
      const result = await service.remove('x', 'owner-1');

      // Assert
      expect(repository.remove).toHaveBeenCalledWith(job);
      expect(result).toEqual(job);
    });

    it('should throw when job is not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act + Assert
      await expect(service.remove('missing', 'owner-1')).rejects.toThrow(
        new NotFoundException('Log analysis job not found'),
      );

      // Assert — side effects
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
