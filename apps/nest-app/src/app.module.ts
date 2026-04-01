import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServersModule } from './remote-servers/remote-servers.module';
import { AuthModule } from './auth/auth.module';
import { LogResourcesModule } from './log-resources/log-resources.module';
import { LogAnalysisModule } from './log-analysis/log-analysis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TicketingModule } from './ticketing/ticketing.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogResourcesModule,
    LogAnalysisModule,
    TicketingModule,
    EventEmitterModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
