# lisk-extended-api
Extends api with asset filter.

## Install
`npm install --save @moosty/lisk-extended-api`

## Usage
Add module to your Lisk SDK application
```js
import { ExtendedHTTPApiModule } from "@moosty/lisk-extended-api";

app.registerModule(ExtendedHTTPApiModule, {
  port: 1234, // default 2020 
  limit: 1000, // default 100
  assets: [ // allowed assets
    'recipientId',
    'unit.total',
  ],
});
```

## API

The http api is for the `transactions` and `accounts` and filters on 
assets. 

Examples:

Asset exists in `transaction` or `account`

`http://localhost:2020/extended-api/transactions?asset=foo`

`http://localhost:2020/extended-api/accounts?asset=foo`

Asset has specific value:

`http://localhost:2020/extended-api/transactions?asset=foo&contains=bar`

`http://localhost:2020/extended-api/accounts?asset=foo&contains=bar`

`http://localhost:2020/extended-api/transactions?asset=recipientId&contains=395830482304L&limit=100`

`http://localhost:2020/extended-api/transactions?asset=nested.field&contains=22&offset=0`

Type selection: (Thanks to [@tomploem](https://github.com/tomploem))

`http://localhost:2020/extended-api/transactions?asset=foo&contains=bar&type=31`
