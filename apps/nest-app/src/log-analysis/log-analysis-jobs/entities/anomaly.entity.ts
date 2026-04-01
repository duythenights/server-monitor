import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LogAnalysisJobEntity } from './log-analysis-job.entity';

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AnomalyStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity()
export class AnomalyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: AnomalyStatus.OPEN })
  status: AnomalyStatus;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', default: AnomalySeverity.LOW })
  severity: AnomalySeverity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  ticketInfo?: Record<string, unknown>;

  @ManyToOne(() => LogAnalysisJobEntity, (job) => job.anomalies)
  logAnalysisJob: LogAnalysisJobEntity;
}
