<h1 style="display: flex;align-items: center; gap:1rem"><img src="./preview/logo-sm.png"/> Hyper Admin Panel Telegram robot </h1>  
<a href='https://github.com/hoomanFsmo77/Hyper-admin-panel/tree/master/frontend' target="_blank"><img alt='' src='https://img.shields.io/badge/Release_V1.2.1-100000?style=flat&logo=&logoColor=3178C6&labelColor=333333&color=333333'/></a>

## Tech

<a href='https://nodejs.org/en' target="_blank"><img alt='nodedotjs' src='https://img.shields.io/badge/Node_js v16-100000?style=flat&logo=nodedotjs&logoColor=339933&labelColor=#333&color=#333'/></a>
<a href='https://expressjs.com/' target="_blank"><img alt='express' src='https://img.shields.io/badge/Express_js v4.18-100000?style=flat&logo=express&logoColor=00FF04&labelColor=#333&color=#333'/></a>
<a href='https://www.mongodb.com/' target="_blank"><img alt='mongodb' src='https://img.shields.io/badge/Mongodb_v4.4-100000?style=flat&logo=mongodb&logoColor=47A248&labelColor=#333&color=#333'/></a>
## commands
```
/users - users list
/online - online users
/generate - generate user 
/delete - delete user 
/unlock - unlock user
/lock - lock user
/reset - reset password
/create - create admin user
/delete_admin - delete admin user
/referral_token - get referral token
/change_multi -  change user multi
/add_paypal -  add your paypal link
```

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

| Key            | Type     | Description                                                 | default
|:---------------| :------- |:------------------------------------------------------------|:-------------------------------------------------|
| `PORT` | `string` | **Optional** api running port                               | 3000
| `PRODUCTION` | `string` | **Required** 1=production 0=development                     | undefined
| `DB_D_URL` | `string` | **Required** mongodb url in development (when PRODUCTION=0) | undefined
| `DB_P_URL` | `string` | **Required** mongodb url in production (when PRODUCTION=1)  | undefined
| `DB_NAME` | `string` | **Required** mongodb database name                          | undefined
| `BOT_TOKEN` | `string` | **Required** bot token                                      | undefined
| `API_PORT` | `string` | **Optional** api port running in hyper apps                 | 6655

## Running Server

Start the server on `http://localhost:3000`

```bash
npm run start
```
