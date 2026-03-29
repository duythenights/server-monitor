import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LogResourcesService } from './log-resources.service';
import { CreateLogResourceDto } from './dto/create-log-resource.dto';
import { UpdateLogResourceDto } from './dto/update-log-resource.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { ICurrentUser } from 'src/auth/current-user.interface';

@Controller('log-resources')
export class LogResourcesController {
  constructor(private readonly logResourcesService: LogResourcesService) {}

  @Post()
  create(
    @Body() createLogResourceDto: CreateLogResourceDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logResourcesService.create(
      createLogResourceDto,
      currentUser.id,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logResourcesService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logResourcesService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogResourceDto: UpdateLogResourceDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logResourcesService.update(
      id,
      currentUser.id,
      updateLogResourceDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logResourcesService.remove(id, currentUser.id);
  }
}
