import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LogAnalysisJobType } from '../entities/log-analysis-job.entity';

export class CreateLogAnalysisJobDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LogAnalysisJobType)
  @IsNotEmpty()
  type: LogAnalysisJobType;

  @IsString()
  @IsOptional()
  logSourceId?: string;

  @IsString()
  remoteServerId?: string;
}
