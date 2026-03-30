import { Module } from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service';
import { RemoteServersController } from './remote-servers.controller';
import { RemoteServerEntity } from './entities/remote-server.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteServerEntity])],
  controllers: [RemoteServersController],
  providers: [RemoteServersService],
  exports: [RemoteServersService],
})
export class RemoteServersModule {}
