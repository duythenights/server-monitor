import { CurrentUser } from '@/auth/current-user.decorator';
import { UserEntity } from '@/users/entities/user.entity';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LogAnalysisService } from './log-analysis.service';

@Controller('log-analysis')
export class LogAnalysisController {
  constructor(private readonly logAnalysisService: LogAnalysisService) {}
  @ApiBody({
    type: Array<Record<string, any>>,
  })
  @Post('ingest/:jobId')
  @HttpCode(HttpStatus.CREATED)
  ingestLog(
    @Body() body: Array<Record<string, any>>,
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.logAnalysisService.ingestLog(jobId, user.id, body);
  }
}
