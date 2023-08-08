<h1 style="display: flex;align-items: center; gap:1rem"><img src="../logo-sm.png"/> Hyper  Users Telegram bot </h1>  
<a href='https://github.com/HyperPanelx/hyper-telegram-bot' target="_blank"><img alt='' src='https://img.shields.io/badge/Release_V1.2.3-100000?style=flat&logo=&logoColor=3178C6&labelColor=333333&color=333333'/></a>

## Tech

<a href='https://nodejs.org/en' target="_blank"><img alt='nodedotjs' src='https://img.shields.io/badge/Node_js v16-100000?style=flat&logo=nodedotjs&logoColor=339933&labelColor=333333&color=333333'/></a>
<a href='https://expressjs.com/' target="_blank"><img alt='express' src='https://img.shields.io/badge/Express_js v4.18-100000?style=flat&logo=express&logoColor=339933&labelColor=333333&color=333333'/></a>
<a href='https://www.mongodb.com/' target="_blank"><img alt='mongodb' src='https://img.shields.io/badge/Mongodb-100000?style=flat&logo=mongodb&logoColor=47A248&labelColor=333333&color=333333'/></a>

## Setup for developing project

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```
## environment variables (.env)

| Key            | Type     | Description                                                                                              | default
|:---------------| :------- |:---------------------------------------------------------------------------------------------------------|:-------------------------------------------------|
| `PORT` | `string` | **Optional** api running port                                                                            | 3000
| `PRODUCTION` | `string` | **Required** 1=production 0=development                                                                  | undefined
| `DB_D_URL` | `string` | **Required** mongodb url in development (when PRODUCTION=0)                                              | undefined
| `DB_P_URL` | `string` | **Required** mongodb url in production (when PRODUCTION=1)                                               | undefined
| `DB_NAME` | `string` | **Required** mongodb database name (when PRODUCTION=0)                                                   | undefined
| `BOT_TOKEN` | `string` | **Required** bot token                                                                                   | undefined
| `IP_API_KEY` | `string` | **Required** get location base on ip address api key: 3b0467b6-7ae9-4230-a40a-4d36b5c63080               | undefined
| `CALLBACK_URL` | `string` | **Required** url when payment is over : http://hyper-payment.hoomanmousavi.ir/verify.html                | undefined
| `REDIRECT_URL` | `string` | **Required** url when payment is about to start : http://hyper-payment.hoomanmousavi.ir/transaction.html | undefined
| `SERVER_IP` | `string` | **Required** Server ip address where this bot is running                                                 | undefined
| `ZARIN_PAY_REQUEST` | `string` | **Required** zarin pal authority url : https://api.zarinpal.com/pg/v4/payment/request.json               | undefined
| `ZARIN_PAY_VERIFY` | `string` | **Required** zarin pal verify url : https://api.zarinpal.com/pg/v4/payment/verify.json                   |undefined
| `ZARIN_PAY_LINK` | `string` | **Required** zarin pal payment url : https://www.zarinpal.com/pg/StartPay/                               |undefined
## Running Server

Start the server on `http://localhost:3000`

```bash
npm run start
```
