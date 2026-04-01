import {
  AnomalyEntity,
  AnomalySeverity,
  AnomalyStatus,
} from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';
import { AnomalyCreatedEvent } from '@/shared/events/anomaly.event';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { TicketSeverity } from './ticketing.types';
import { LogAnalysisJobsService } from '@/log-analysis/log-analysis-jobs/log-analysis-jobs.service';

@Injectable()
export class TicketingService {
  constructor(
    private readonly ticketingProviderFactory: TicketingProviderFactory,
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
    @InjectRepository(AnomalyEntity)
    private readonly anomalyRepository: Repository<AnomalyEntity>,
  ) {}
  @OnEvent(AnomalyCreatedEvent.name)
  async handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {
    const { ownerId, jobId, anomalyId } = event.payload;

    const job = await this.logAnalysisJobsService.findOne(jobId, ownerId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const anomaly = await this.anomalyRepository.findOneBy({ id: anomalyId });
    if (!anomaly) {
      throw new NotFoundException('Anomaly not found');
    }

    if (anomaly.status !== AnomalyStatus.OPEN) {
      return;
    }

    const providerConfig = job.ticketingSystemConfig;
    // If no provider config, return early
    if (!providerConfig?.type) {
      return;
    }

    const provider =
      this.ticketingProviderFactory.createProvider(providerConfig);

    return provider.createTicket({
      title: anomaly.title,
      description: anomaly.description,
      severity: this.mapSeverity(anomaly.severity),
    });
  }
  mapSeverity(severity: AnomalySeverity): TicketSeverity {
    switch (severity) {
      case AnomalySeverity.CRITICAL:
        return TicketSeverity.CRITICAL;
      case AnomalySeverity.HIGH:
        return TicketSeverity.HIGH;
      case AnomalySeverity.MEDIUM:
        return TicketSeverity.MEDIUM;
      case AnomalySeverity.LOW:
        return TicketSeverity.LOW;
    }
  }
}
