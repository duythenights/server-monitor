import { IsOptional, IsString } from 'class-validator';

export class UpdateLogAnalysisJobDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
