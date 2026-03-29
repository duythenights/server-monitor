import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogResourceDto } from './dto/create-log-resource.dto';
import { UpdateLogResourceDto } from './dto/update-log-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LogResourceEntity,
  LogSourseStatus,
} from './entities/log-resource.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogResourcesService {
  constructor(
    @InjectRepository(LogResourceEntity)
    private readonly logResourceRepository: Repository<LogResourceEntity>,
  ) {}
  create(createLogResourceDto: CreateLogResourceDto, ownerId: string) {
    const logResource = this.logResourceRepository.create({
      ...createLogResourceDto,
      ownerId,
      status: LogSourseStatus.UNKNOWN,
    });
    return this.logResourceRepository.save(logResource);
  }

  findAll(ownerId: string) {
    return this.logResourceRepository.find({ where: { ownerId } });
  }

  findById(id: string, ownerId: string) {
    return this.logResourceRepository.findOneBy({ id, ownerId });
  }
  findOne(id: string, ownerId: string) {
    return this.findById(id, ownerId);
  }

  async update(
    id: string,
    ownerId: string,
    updateLogResourceDto: UpdateLogResourceDto,
  ) {
    const logResource = await this.findById(id, ownerId);
    if (!logResource) {
      throw new NotFoundException('Log resource not found');
    }
    return this.logResourceRepository.save({
      ...logResource,
      ...updateLogResourceDto,
    });
  }

  async remove(id: string, ownerId: string) {
    const logResource = await this.findById(id, ownerId);
    if (!logResource) {
      throw new NotFoundException('Log resource not found');
    }
    return this.logResourceRepository.remove(logResource);
  }
}
