import { LogResourceEntity } from '@/log-resources/entities/log-resource.entity';
import { RemoteServerEntity } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  status: LogAnalysisJobStatus;

  @Column()
  type: LogAnalysisJobType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LogResourceEntity)
  @JoinColumn()
  logSource: LogResourceEntity;

  @OneToOne(() => RemoteServerEntity)
  @JoinColumn()
  remoteServer: RemoteServerEntity;
}
