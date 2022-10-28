import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Camera extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  url!: string;

  @Column({ nullable: true })
  port?: number;

  @Column({ nullable: true })
  rtspPort?: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'simple-json', nullable: true })
  options?: any;
}
