import { Injectable, NotFoundException } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs/log-analysis-jobs.service';
import { AnomalySeverity } from './log-analysis-jobs/entities/anomaly.entity';

@Injectable()
export class LogAnalysisService {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}
  async ingestLog(
    jobId: string,
    ownerId: string,
    logs: Array<Record<string, any>>,
  ) {
    const job = await this.logAnalysisJobsService.findOne(jobId, ownerId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    for (const log of logs) {
      const message = (log['message'] as string) || 'Unknown Log Message';
      const level = (log['level'] as string) || 'error';
      await this.logAnalysisJobsService.addAnomaly(job, {
        title: message,
        severity:
          level === 'critical'
            ? AnomalySeverity.CRITICAL
            : AnomalySeverity.HIGH,
      });
    }
  }
}
