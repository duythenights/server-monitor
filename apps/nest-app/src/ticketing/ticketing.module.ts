import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketingService } from './ticketing.service';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory';
import { LogAnalysisJobsModule } from '@/log-analysis/log-analysis-jobs/log-analysis-jobs.module';
import { AnomalyEntity } from '@/log-analysis/log-analysis-jobs/entities/anomaly.entity';

@Module({
  providers: [TicketingService, TicketingProviderFactory],
  imports: [LogAnalysisJobsModule, TypeOrmModule.forFeature([AnomalyEntity])],
})
export class TicketingModule {}
