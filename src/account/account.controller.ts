import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Account } from 'src/entities/account.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { AccountService } from './account.service';

// in real app should received during authentification process
const personId = 1;

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  getAccounts(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Post()
  createAccount(@Body() account: Account): Promise<Account> {
    return this.accountService.createForPerson(personId, account);
  }

  @Get(':accountId/balance')
  async inquere(
    @Param('accountId') accountId: number,
  ): Promise<{ balance: number }> {
    const account = await this.accountService.findById(accountId);

    if (!account) {
      throw new NotFoundException();
    }
    if (!account.activeFlag) {
      throw new ForbiddenException('Account is blocked');
    }

    return {
      balance: account.balance,
    };
  }

  @Post(':accountId/deposit')
  async deposit(
    @Param('accountId') accountId: number,
    @Body()
    transaction: {
      value: number;
    },
  ): Promise<Transaction> {
    const account = await this.accountService.findById(accountId);

    if (transaction.value <= 0) {
      throw new BadRequestException('Value must be greater then 0');
    }
    if (!account) {
      throw new NotFoundException();
    }
    if (!account.activeFlag) {
      throw new ForbiddenException('Account is blocked');
    }

    return this.accountService.applyTransaction(account, transaction.value);
  }

  // check limits and is account blocked
  @Post(':accountId/withdraw')
  async withdraw(
    @Param('accountId') accountId: number,
    @Body()
    transaction: {
      value: number;
    },
  ): Promise<Transaction> {
    const account = await this.accountService.findById(accountId);

    if (transaction.value <= 0) {
      throw new BadRequestException('Value must be greater then 0');
    }

    if (!account) {
      throw new NotFoundException();
    }
    if (!account.activeFlag) {
      throw new ForbiddenException('Account is blocked');
    }

    const withdrawLimitForToday =
      await this.accountService.getWithdrawLimitForToday(accountId);
    if (transaction.value > withdrawLimitForToday) {
      throw new ForbiddenException('You have reached daily withdraw limit');
    }

    return this.accountService.applyTransaction(account, -transaction.value);
  }

  @Post(':accountId/block')
  async blockAccount(@Param('accountId') accountId: number): Promise<Account> {
    const account = await this.accountService.findById(accountId);

    if (!account) {
      throw new NotFoundException();
    }

    return this.accountService.blockAccount(account);
  }

  @Get(':accountId/transactions')
  async transactions(
    @Param('accountId') accountId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<Transaction[]> {
    const account = await this.accountService.findById(accountId);

    if (!account) {
      throw new NotFoundException();
    }
    if (!account.activeFlag) {
      throw new ForbiddenException('Account is blocked');
    }

    return this.accountService.getTransactionsByPeriod(accountId, from, to);
  }
}
