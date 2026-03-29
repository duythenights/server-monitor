import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RemoteServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown',
}

@Entity()
export class RemoteServerEntity {
  @PrimaryColumn({ type: 'uuid', generated: 'uuid' })
  id: string;
  @Column()
  name: string;
  @Column()
  ownerId: string;
  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  config: Record<string, any>;

  @Column()
  status: RemoteServerStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
