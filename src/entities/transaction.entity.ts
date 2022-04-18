import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  transactionId: number;

  @Column()
  accountId: number;

  @Column()
  value: number;

  @CreateDateColumn()
  transactionDate: Date;

  @ManyToOne(() => Account, (a) => a.transactions)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
