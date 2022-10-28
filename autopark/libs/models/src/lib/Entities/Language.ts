import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  code!: string;

  @Column({ nullable: true })
  localizeCode!: string;

  @OneToMany(() => Translation, (translation) => translation.language, {
    cascade: true,
    onDelete: 'SET NULL',
  }) // note: we will create author property in the Photo class below
  translations!: Translation[];
}

@Entity()
export class Translation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  ns!: string;

  @Column({ nullable: true })
  key!: string;

  @Column({ nullable: true })
  value!: string;

  @ManyToOne(() => Language, (language) => language.translations, {})
  language!: Language;
}
