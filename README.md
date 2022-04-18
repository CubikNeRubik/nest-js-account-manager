## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start
```

## Available API

### Create account
```
POST /account
{
  "dailyWithdrawalLimit": number
}

Response:
{
  "accountId": number,
  "personId": number,
  "balance": number,
  "dailyWithdrawalLimit": number,
  "activeFlag": boolean,
  "accountType": number,
  "createDate": Date
}
```

### Deposit

Account should be active. `value` should be positive.

```
POST /account/{accountId}/deposit
{
  "value": number
}

Response:
{
  "value": number,
  "account": Account,
  "transactionId": number,
  "transactionDate": Date
}
```

### Withdraw

Account should be active. `value` should be positive. Can be rejected according to daily withdraw limit.

```
POST /account/{accountId}/deposit
{
  "value": number
}

Response:
{
  "value": number,
  "account": Account,
  "transactionId": number,
  "transactionDate": Date
}
```

### Balance

Account should be active.

```
GET /account/{accountId}/balance

Response:
{
  "balance": number
}
```

### Transactions

Account should be active.
`from` is optional (2022-04-18 20:00:05)
`to` is optional (2022-04-18 20:00:05)

```
GET /account/{accountId}/transactions?from=2022-04-18 19:00:05&to=2022-04-18 20:00:00
```
