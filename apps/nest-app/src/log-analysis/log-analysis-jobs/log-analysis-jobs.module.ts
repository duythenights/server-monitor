import { Module } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAnalysisJobEntity } from './entities/log-analysis-job.entity';
import { LogResourcesModule } from 'src/log-resources/log-resources.module';
import { RemoteServersModule } from 'src/remote-servers/remote-servers.module';
import { AnomalyEntity } from './entities/anomaly.entity';

@Module({
  controllers: [LogAnalysisJobsController],
  providers: [LogAnalysisJobsService],
  imports: [
    TypeOrmModule.forFeature([LogAnalysisJobEntity, AnomalyEntity]),
    LogResourcesModule,
    RemoteServersModule,
  ],
  exports: [LogAnalysisJobsService],
})
export class LogAnalysisJobsModule {}
