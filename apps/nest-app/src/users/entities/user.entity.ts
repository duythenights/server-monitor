import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryColumn({ type: 'uuid', generated: 'uuid' })
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
}
