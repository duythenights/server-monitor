import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { LogSourseType } from '../entities/log-resource.entity';

export class CreateLogResourceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LogSourseType)
  type: LogSourseType;

  @IsObject()
  config: Record<string, any>;
}
