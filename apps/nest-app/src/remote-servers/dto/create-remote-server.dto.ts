import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRemoteServerDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  // @IsString()
  // @IsNotEmpty()
  // ownerId: string;
  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  config: Record<string, any>;
}
