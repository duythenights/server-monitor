import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import {
  RemoteServerEntity,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { REMOTE_SERVERS_LIMIT } from './remote-servers.constants';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServerEntity)
    private readonly remoteServerRepository: Repository<RemoteServerEntity>,
  ) {}
  async create(props: CreateRemoteServerDto, ownerId: string) {
    const count = await this.remoteServerRepository.count({
      where: { ownerId },
    });
    if (count >= REMOTE_SERVERS_LIMIT) {
      throw new ConflictException(
        'You have reached the limit of remote servers',
      );
    }
    const remoteServer = this.remoteServerRepository.create({
      ...props,
      ownerId,
      status: RemoteServerStatus.UNKNOWN,
    });
    return this.remoteServerRepository.save(remoteServer);
  }

  findAll(ownerId: string) {
    return this.remoteServerRepository.find({ where: { ownerId } });
  }

  /**
   * Loads a remote server by id and ensures the authenticated user owns it.
   * @param id - Remote server primary key.
   * @param ownerId - Authenticated user id expected to own the server.
   * @returns The persisted entity when found and owned.
   */
  private async getByIdForOwner(
    id: string,
    ownerId: string,
  ): Promise<RemoteServerEntity> {
    const remoteServer = await this.remoteServerRepository.findOneBy({ id });
    if (!remoteServer) {
      throw new NotFoundException('Remote server not found');
    }
    if (remoteServer.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not the owner of this remote server',
      );
    }
    return remoteServer;
  }

  findOne(id: string, ownerId: string) {
    return this.getByIdForOwner(id, ownerId);
  }

  async update(
    id: string,
    ownerId: string,
    updateRemoteServerDto: UpdateRemoteServerDto,
  ) {
    const remoteServer = await this.getByIdForOwner(id, ownerId);
    return this.remoteServerRepository.save({
      ...remoteServer,
      ...updateRemoteServerDto,
    });
  }

  async remove(id: string, ownerId: string) {
    const remoteServer = await this.getByIdForOwner(id, ownerId);
    return this.remoteServerRepository.remove(remoteServer);
  }
}
