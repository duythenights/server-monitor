import { PartialType } from '@nestjs/swagger';
import { CreateRemoteServerDto } from './create-remote-server.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRemoteServerDto extends PartialType(CreateRemoteServerDto) {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  ownerId?: string;
  @IsString()
  @IsOptional()
  description?: string;
}
