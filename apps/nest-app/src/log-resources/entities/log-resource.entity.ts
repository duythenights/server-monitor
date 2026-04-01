import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogSourseType {
  ZABBIX = 'zabbix',
  PROMETHEUS = 'prometheus',
}
export enum LogSourseStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown',
}
@Entity()
export class LogResourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', default: LogSourseStatus.UNKNOWN })
  status: LogSourseStatus;

  @Column({ type: 'text', default: LogSourseType.ZABBIX })
  type: LogSourseType;

  @Column({ type: 'simple-json' })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
