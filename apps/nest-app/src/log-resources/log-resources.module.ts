import { Module } from '@nestjs/common';
import { LogResourcesService } from './log-resources.service';
import { LogResourcesController } from './log-resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogResourceEntity } from './entities/log-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogResourceEntity])],
  controllers: [LogResourcesController],
  providers: [LogResourcesService],
  exports: [LogResourcesService],
})
export class LogResourcesModule {}
