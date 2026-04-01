import { DatabaseTestModule } from '@/database/database-test.module';
import { DatabaseModule } from '@/database/database.module';
import { CreateLogAnalysisJobDto } from '@/log-analysis/log-analysis-jobs/dto/create-log-analysis-job.dto';
import { LogAnalysisJobType } from '@/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity';
import { CreateRemoteServerDto } from '@/remote-servers/dto/create-remote-server.dto';
import { TicketingProviderFactory } from '@/ticketing/ticketing-providers/ticketing-provider.factory';
import { ITicketingProvider } from '@/ticketing/ticketing-providers/ticketing-provider.interface';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { resetDatabase } from './test-utils';
import { ServiceNowTicketingProvider } from '@/ticketing/ticketing-providers/services-now-ticketing-provider';

describe('Ticket Creation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let moduleFixture: TestingModule;
  const ticketProviderFactory = mock<TicketingProviderFactory>();
  const ticketProvider = mock<ITicketingProvider>();

  ticketProviderFactory.createProvider.mockReturnValue(ticketProvider);

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseTestModule)
      .overrideProvider(TicketingProviderFactory)
      .useValue(ticketProviderFactory)
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await app.init();
  });

  afterEach(async () => {
    await resetDatabase(dataSource);
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('ticket creation', () => {
    it('should create a ticket', async () => {
      // create remote server
      const createRemoteServerDto: CreateRemoteServerDto = {
        name: 'test-server',
        config: {
          ipAddress: '[IP_ADDRESS]',
          port: 22,
          username: 'test',
          password: 'test',
        },
      };
      const createRemoteServerResponse = await request(app.getHttpServer())
        .post('/remote-servers')
        .send(createRemoteServerDto);
      expect(createRemoteServerResponse.status).toBe(201);
      expect(createRemoteServerResponse.body).toBeDefined();
      // create job
      const createJobDto: CreateLogAnalysisJobDto = {
        remoteServerId: createRemoteServerResponse.body.id as string,
        name: 'test-job',
        type: LogAnalysisJobType.ONE_TIME,
        ticketingSystemConfig: {
          type: ServiceNowTicketingProvider.name,
        },
      };
      const createJobResponse = await request(app.getHttpServer())
        .post('/log-analysis-jobs')
        .send(createJobDto);
      expect(createJobResponse.status).toBe(201);
      expect(createJobResponse.body).toBeDefined();
      // send error logs to the job
      const errorLogs = [
        {
          message: 'Errorrrrr',
          level: 'error',
        },
      ];
      const sendErrorLogsResponse = await request(app.getHttpServer())
        .post(`/log-analysis/ingest/${createJobResponse.body.id as string}`)
        .send(errorLogs);
      expect(sendErrorLogsResponse.status).toBe(201);
      expect(sendErrorLogsResponse.body).toBeDefined();

      // verify the ticket was created
      expect(ticketProvider.createTicket).toHaveBeenCalledTimes(1);
    });
  });
});
