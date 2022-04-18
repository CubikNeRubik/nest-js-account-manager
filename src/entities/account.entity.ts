import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column()
  personId: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 0 })
  dailyWithdrawalLimit: number;

  @Column({ default: true })
  activeFlag: boolean;

  @Column({ default: 1 })
  accountType: number;

  @CreateDateColumn()
  createDate: Date;

  @OneToMany(() => Transaction, (t) => t.account)
  transactions: Transaction[];

  @ManyToOne(() => Person, (p) => p.accounts)
  @JoinColumn({ name: 'personId' })
  person: Person;
}
