import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  personId: number;

  @Column()
  name: string;

  @Column()
  document: string;

  @Column()
  birthDate: Date;

  @OneToMany(() => Account, (a) => a.person)
  accounts: Account[];
}
