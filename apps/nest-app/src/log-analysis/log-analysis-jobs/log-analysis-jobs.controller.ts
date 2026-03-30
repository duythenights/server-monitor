import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { ICurrentUser } from 'src/auth/current-user.interface';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}

  @Post()
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.create(
      createLogAnalysisJobDto,
      currentUser.id,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.update(
      id,
      currentUser.id,
      updateLogAnalysisJobDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.remove(id, currentUser.id);
  }
}
