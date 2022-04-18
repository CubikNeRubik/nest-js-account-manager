import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Connection, Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

function startOfDay() {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

@Injectable()
export class AccountService {
  constructor(
    private connection: Connection,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  findAll(): Promise<Account[]> {
    return this.accountsRepository.find();
  }

  async getWithdrawLimitForToday(accountId: number): Promise<number> {
    const account = await this.findById(accountId);
    const { currentWithdraw } = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('accountId = :accountId', { accountId })
      .andWhere('transactionDate > :date', { date: startOfDay() })
      .andWhere('value < 0')
      .select('SUM(value)', 'currentWithdraw')
      .getRawOne();

    return account.dailyWithdrawalLimit + currentWithdraw;
  }

  // Implement path that performs balance inquiry operation on a given account.
  findById(id: number): Promise<Account> {
    return this.accountsRepository.findOne(id);
  }

  // Implement path that performs the creation of an account.
  async createForPerson(personId: number, account: Account): Promise<Account> {
    return this.create({
      personId,
      ...account,
    });
  }

  async create(account: Account): Promise<Account> {
    const createdAccount = await this.accountsRepository.create(account);
    return this.accountsRepository.save(createdAccount);
  }

  // Implement path that performs deposit operation on an account.
  // Implement path that performs withdrawal operation on an account.
  async applyTransaction(
    account: Account,
    value: number,
  ): Promise<Transaction> {
    account.balance += value;
    const transaction = await this.transactionRepository.create({
      account,
      value,
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save<Account>(account);
      await queryRunner.manager.save<Transaction>(transaction);

      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
      return transaction;
    }
  }

  // Implement path that performs the blocking of an account.
  blockAccount(account: Account): Promise<Account> {
    account.activeFlag = false;
    return this.accountsRepository.save(account);
  }

  // Implement path that retrieves the account statement of transactions.
  async getTransactionsByPeriod(
    accountId: number,
    from: string,
    to: string,
  ): Promise<Transaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder()
      .where('accountId = :accountId', { accountId });

    if (from) {
      query.andWhere('transactionDate > :from', { from });
    }

    if (to) {
      query.andWhere('transactionDate < :to', { to });
    }

    return query.getMany();
  }
}
