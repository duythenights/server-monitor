import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import {
  AnomalyEntity,
  AnomalySeverity,
  AnomalyStatus,
} from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import {
  LogAnalysisJobEntity,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from '@/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity';
import { LogAnalysisJobsService } from '@/log-analysis/log-analysis-jobs/log-analysis-jobs.service';
import { Ticket, TicketSeverity, TicketStatus } from './ticketing.types';
import { ITicketingProvider } from './ticketing-providers/ticketing-provider.interface';

function sampleAnomaly(overrides: Partial<AnomalyEntity> = {}): AnomalyEntity {
  const now = new Date();
  return {
    id: 'anomaly-1',
    title: 'High CPU usage detected',
    description: 'CPU usage exceeded 90%',
    severity: AnomalySeverity.HIGH,
    status: AnomalyStatus.OPEN,
    createdAt: now,
    updatedAt: now,
    ticketInfo: null,
    ...overrides,
  } as AnomalyEntity;
}

function sampleJob(
  overrides: Partial<LogAnalysisJobEntity> = {},
): LogAnalysisJobEntity {
  const now = new Date();
  return {
    id: 'job-1',
    ownerId: 'owner-1',
    name: 'job',
    description: 'desc',
    ticketingSystemConfig: {
      type: 'ServiceNowTicketingProvider',
      provider: 'ServiceNowTicketingProvider',
      'api-key': '123',
    },
    status: LogAnalysisJobStatus.INITIALIZED,
    type: LogAnalysisJobType.ONE_TIME,
    createdAt: now,
    updatedAt: now,
    anomalies: [sampleAnomaly()],
    ...overrides,
  } as LogAnalysisJobEntity;
}

function sampleTicket(overrides: Partial<Ticket> = {}): Ticket {
  const now = new Date();
  return {
    id: 'ticket-1',
    title: 'High CPU usage detected',
    description: 'CPU usage exceeded 90%',
    severity: TicketSeverity.HIGH,
    status: TicketStatus.OPEN,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('TicketingService', () => {
  let service: TicketingService;
  let ticketingProviderFactory: Mocked<TicketingProviderFactory>;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        {
          provide: TicketingProviderFactory,
          useValue: mock<TicketingProviderFactory>(),
        },
        {
          provide: LogAnalysisJobsService,
          useValue: mock<LogAnalysisJobsService>(),
        },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
    ticketingProviderFactory = module.get<Mocked<TicketingProviderFactory>>(
      TicketingProviderFactory,
    );
    logAnalysisJobsService = module.get<Mocked<LogAnalysisJobsService>>(
      LogAnalysisJobsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleAnomalyCreatedEvent', () => {
    it('should throw NotFoundException when job is not found', async () => {
      // Arrange
      logAnalysisJobsService.findOne.mockResolvedValue(null);
      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'missing-job',
        anomalyId: 'anomaly-1',
      });

      // Act + Assert
      await expect(service.handleAnomalyCreatedEvent(event)).rejects.toThrow(
        new NotFoundException('Job not found'),
      );
      expect(ticketingProviderFactory.createProvider).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when anomaly is not found in job', async () => {
      // Arrange
      const job = sampleJob({ anomalies: [sampleAnomaly({ id: 'other-id' })] });
      logAnalysisJobsService.findOne.mockResolvedValue(job);
      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'job-1',
        anomalyId: 'non-existent-anomaly',
      });

      // Act + Assert
      await expect(service.handleAnomalyCreatedEvent(event)).rejects.toThrow(
        new NotFoundException('Anomaly not found'),
      );
      expect(ticketingProviderFactory.createProvider).not.toHaveBeenCalled();
    });

    it('should return early when anomaly status is not OPEN', async () => {
      // Arrange
      const anomaly = sampleAnomaly({ status: AnomalyStatus.CLOSED });
      const job = sampleJob({ anomalies: [anomaly] });
      logAnalysisJobsService.findOne.mockResolvedValue(job);
      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'job-1',
        anomalyId: 'anomaly-1',
      });

      // Act
      const result = await service.handleAnomalyCreatedEvent(event);

      // Assert
      expect(result).toBeUndefined();
      expect(ticketingProviderFactory.createProvider).not.toHaveBeenCalled();
    });

    it('should return early when job has no ticketingSystemConfig', async () => {
      // Arrange
      const job = sampleJob({ ticketingSystemConfig: undefined });
      logAnalysisJobsService.findOne.mockResolvedValue(job);
      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'job-1',
        anomalyId: 'anomaly-1',
      });

      // Act
      const result = await service.handleAnomalyCreatedEvent(event);

      // Assert
      expect(result).toBeUndefined();
      expect(ticketingProviderFactory.createProvider).not.toHaveBeenCalled();
    });

    it('should return early when ticketingSystemConfig has no type', async () => {
      // Arrange
      const job = sampleJob({
        ticketingSystemConfig: { provider: 'x' },
      });
      logAnalysisJobsService.findOne.mockResolvedValue(job);
      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'job-1',
        anomalyId: 'anomaly-1',
      });

      // Act
      const result = await service.handleAnomalyCreatedEvent(event);

      // Assert
      expect(result).toBeUndefined();
      expect(ticketingProviderFactory.createProvider).not.toHaveBeenCalled();
    });

    it('should create a ticket via the provider when all data is valid', async () => {
      // Arrange
      const anomaly = sampleAnomaly({
        id: 'anomaly-1',
        title: 'Disk full',
        description: 'Disk usage at 100%',
        severity: AnomalySeverity.CRITICAL,
      });
      const job = sampleJob({ anomalies: [anomaly] });
      logAnalysisJobsService.findOne.mockResolvedValue(job);

      const ticket = sampleTicket({
        title: 'Disk full',
        description: 'Disk usage at 100%',
        severity: TicketSeverity.CRITICAL,
      });
      const mockProvider = mock<ITicketingProvider>();
      mockProvider.createTicket.mockResolvedValue(ticket);
      ticketingProviderFactory.createProvider.mockReturnValue(mockProvider);

      const event = new AnomalyCreatedEvent({
        ownerId: 'owner-1',
        jobId: 'job-1',
        anomalyId: 'anomaly-1',
      });

      // Act
      const result = await service.handleAnomalyCreatedEvent(event);

      // Assert
      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(
        'job-1',
        'owner-1',
      );
      expect(ticketingProviderFactory.createProvider).toHaveBeenCalledWith(
        job.ticketingSystemConfig,
      );
      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: 'Disk full',
        description: 'Disk usage at 100%',
        severity: TicketSeverity.CRITICAL,
      });
      expect(result).toEqual(ticket);
    });
  });

  describe('mapSeverity', () => {
    it('should map CRITICAL', () => {
      expect(service.mapSeverity(AnomalySeverity.CRITICAL)).toBe(
        TicketSeverity.CRITICAL,
      );
    });

    it('should map HIGH', () => {
      expect(service.mapSeverity(AnomalySeverity.HIGH)).toBe(
        TicketSeverity.HIGH,
      );
    });

    it('should map MEDIUM', () => {
      expect(service.mapSeverity(AnomalySeverity.MEDIUM)).toBe(
        TicketSeverity.MEDIUM,
      );
    });

    it('should map LOW', () => {
      expect(service.mapSeverity(AnomalySeverity.LOW)).toBe(TicketSeverity.LOW);
    });
  });
});
