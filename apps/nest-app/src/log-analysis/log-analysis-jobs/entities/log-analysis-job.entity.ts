import { LogResourceEntity } from '@/log-resources/entities/log-resource.entity';
import { RemoteServerEntity } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnomalyEntity } from './anomaly.entity';

export enum LogAnalysisJobStatus {
  INITIALIZED = 'initialized',
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum LogAnalysisJobType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

@Entity()
export class LogAnalysisJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  ticketingSystemConfig?: Record<string, unknown>;

  @Column()
  status: LogAnalysisJobStatus;

  @Column()
  type: LogAnalysisJobType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LogResourceEntity, { nullable: true })
  @JoinColumn()
  logSource?: LogResourceEntity;

  @OneToOne(() => RemoteServerEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  remoteServer: RemoteServerEntity;

  @OneToMany(() => AnomalyEntity, (anomaly) => anomaly.logAnalysisJob, {
    onDelete: 'CASCADE',
  })
  anomalies: AnomalyEntity[];
}
