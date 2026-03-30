import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs/log-analysis-jobs.service';
import { AnomalySeverity } from './log-analysis-jobs/entities/anomaly.entity';
import { LogAnalysisService } from './log-analysis.service';
import { LogAnalysisJobEntity } from './log-analysis-jobs/entities/log-analysis-job.entity';

describe('LogAnalysisService', () => {
  let service: LogAnalysisService;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisService,
        {
          provide: LogAnalysisJobsService,
          useValue: mock<LogAnalysisJobsService>(),
        },
      ],
    }).compile();

    service = module.get<LogAnalysisService>(LogAnalysisService);
    logAnalysisJobsService = module.get<Mocked<LogAnalysisJobsService>>(
      LogAnalysisJobsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(logAnalysisJobsService).toBeDefined();
  });

  describe('ingestLog', () => {
    it('should throw NotFoundException if job is not found', async () => {
      // Arrange
      logAnalysisJobsService.findOne.mockResolvedValue(null);

      // Act + Assert
      await expect(
        service.ingestLog('job-1', 'owner-1', [
          { message: 'test', level: 'error' },
        ]),
      ).rejects.toThrow(new NotFoundException('Job not found'));

      // Assert - side effects
      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(
        'job-1',
        'owner-1',
      );
      expect(logAnalysisJobsService.addAnomaly).not.toHaveBeenCalled();
    });

    it('should add anomalies for valid logs with correct severity', async () => {
      // Arrange
      const job = { id: 'job-1' } as LogAnalysisJobEntity;
      logAnalysisJobsService.findOne.mockResolvedValue(job);

      const logs = [
        { message: 'critical issue', level: 'critical' },
        { message: 'error issue', level: 'error' },
        {}, // missing level and message, falls back to defaults
      ];

      // Act
      await service.ingestLog('job-1', 'owner-1', logs);

      // Assert
      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(
        'job-1',
        'owner-1',
      );
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledTimes(3);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        1,
        job,
        {
          title: 'critical issue',
          severity: AnomalySeverity.CRITICAL,
        },
      );

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        2,
        job,
        {
          title: 'error issue',
          severity: AnomalySeverity.HIGH,
        },
      );

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        3,
        job,
        {
          title: 'Unknown Log Message',
          severity: AnomalySeverity.HIGH, // defaults to error -> HIGH
        },
      );
    });
  });
});
