import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LogAnalysisJobEntity,
  LogAnalysisJobStatus,
} from './entities/log-analysis-job.entity';
import { Repository } from 'typeorm';
import { LogResourceEntity } from '@/log-resources/entities/log-resource.entity';
import { LogResourcesService } from '@/log-resources/log-resources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';

@Injectable()
export class LogAnalysisJobsService {
  constructor(
    @InjectRepository(LogAnalysisJobEntity)
    private readonly logAnalysisJobRepository: Repository<LogAnalysisJobEntity>,
    private readonly logResourcesService: LogResourcesService,
    private readonly remoteServersService: RemoteServersService,
  ) {}
  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
    const { logSourceId, remoteServerId, ...rest } = props;

    let logSource: LogResourceEntity | null | undefined;
    if (logSourceId) {
      logSource = await this.logResourcesService.findOne(logSourceId, ownerId);
      if (!logSource) {
        throw new NotFoundException('Log source not found');
      }
    }

    const remoteServer = await this.remoteServersService.findOne(
      remoteServerId!,
      ownerId,
    );
    if (!remoteServer) {
      throw new NotFoundException('Remote server not found');
    }

    const existingJob = await this.logAnalysisJobRepository.findOne({
      where: { remoteServer: { id: remoteServer.id } },
    });
    if (existingJob) {
      throw new ConflictException('Remote server already has an analysis job');
    }

    const logAnalysisJob = this.logAnalysisJobRepository.create({
      ...rest,
      ownerId,
      status: LogAnalysisJobStatus.INITIALIZED,
      ...(logSource && { logSource }),
      remoteServer,
    });
    return this.logAnalysisJobRepository.save(logAnalysisJob);
  }

  findAll(ownerId: string) {
    return this.logAnalysisJobRepository.find({
      where: { ownerId },
      relations: { logSource: true, remoteServer: true },
    });
  }

  findOne(id: string, ownerId: string) {
    return this.logAnalysisJobRepository.findOne({
      where: { id, ownerId },
      relations: { logSource: true, remoteServer: true },
    });
  }

  async update(
    id: string,
    ownerId: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
  ) {
    const logAnalysisJob = await this.findOne(id, ownerId);
    if (!logAnalysisJob) {
      throw new NotFoundException('Log analysis job not found');
    }
    return this.logAnalysisJobRepository.save({
      ...logAnalysisJob,
      ...updateLogAnalysisJobDto,
    });
  }

  async remove(id: string, ownerId: string) {
    const logAnalysisJob = await this.findOne(id, ownerId);
    if (!logAnalysisJob) {
      throw new NotFoundException('Log analysis job not found');
    }
    return this.logAnalysisJobRepository.remove(logAnalysisJob);
  }
}
