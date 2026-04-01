import { LogResourceEntity } from '@/log-resources/entities/log-resource.entity';
import { RemoteServerEntity } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({ type: 'text', default: LogAnalysisJobStatus.INITIALIZED })
  status: LogAnalysisJobStatus;

  @Column({ type: 'text', default: LogAnalysisJobType.ONE_TIME })
  type: LogAnalysisJobType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LogResourceEntity, { nullable: true })
  logSource?: LogResourceEntity;

  @ManyToOne(() => RemoteServerEntity, { onDelete: 'CASCADE' })
  remoteServer: RemoteServerEntity;

  @OneToMany(() => AnomalyEntity, (anomaly) => anomaly.logAnalysisJob, {
    onDelete: 'CASCADE',
  })
  anomalies: AnomalyEntity[];
}
