import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LogAnalysisService } from './log-analysis.service';
import { CurrentUser } from '@/auth/current-user.decorator';
import { UserEntity } from '@/users/entities/user.entity';

@Controller('log-analysis')
export class LogAnalysisController {
  constructor(private readonly logAnalysisService: LogAnalysisService) {}
  @ApiBody({
    type: Array<Record<string, any>>,
  })
  @Post('ingest/:jobId')
  ingestLog(
    @Body() body: Array<Record<string, any>>,
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.logAnalysisService.ingestLog(jobId, user.id, body);
  }
}
