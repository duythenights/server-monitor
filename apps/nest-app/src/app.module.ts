import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServersModule } from './remote-servers/remote-servers.module';
import { AuthModule } from './auth/auth.module';
import { LogResourcesModule } from './log-resources/log-resources.module';
import { LogAnalysisModule } from './log-analysis/log-analysis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogResourcesModule,
    LogAnalysisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
