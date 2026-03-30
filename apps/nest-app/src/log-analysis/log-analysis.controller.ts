import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('log-analysis')
export class LogAnalysisController {
  @ApiBody({
    type: Array<Record<string, any>>,
  })
  @Post('ingest/:jobId')
  ingestLog(
    @Body() body: Array<Record<string, any>>,
    @Param('jobId') jobId: string,
  ) {
    console.log(body);
  }
}
