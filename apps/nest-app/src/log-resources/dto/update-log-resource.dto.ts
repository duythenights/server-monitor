import { PartialType } from '@nestjs/swagger';
import { CreateLogResourceDto } from './create-log-resource.dto';

export class UpdateLogResourceDto extends PartialType(CreateLogResourceDto) {}
