import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Car extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, length: 12 })
  plate!: string;

  @Column({ nullable: true, length: 260 })
  description!: string;

  @Column({ nullable: true, length: 200 })
  imageFilePath?: string;

  @OneToMany(() => CarEntry, (entry) => entry.car)
  entries!: CarEntry[];

  @OneToMany(() => Detects, (entry) => entry.car)
  detects!: Detects[];

  @CreateDateColumn()
  createdDate!: Date;
}

@Entity()
export class CarEntry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Car, (car) => car.entries)
  car!: Car;

  @Column({ nullable: true, type: 'timestamp' })
  entryDate!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  exitDate!: Date;

  @Column({ nullable: true, length: 200 })
  entryImage?: string;

  @Column({ nullable: true, length: 200 })
  exitImage?: string;

  @CreateDateColumn()
  createdDate!: Date;
}

@Entity()
export class Detects extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Car, (car) => car.detects)
  car!: Car;

  @Column({ nullable: true, type: 'json' })
  data!: any;

  @Column({ nullable: true, length: 200 })
  plateImage?: string;

  @Column({ nullable: true, length: 200 })
  image?: string;

  @CreateDateColumn()
  createdDate!: Date;
}
