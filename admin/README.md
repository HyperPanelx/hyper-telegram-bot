<h1 style="display: flex;align-items: center; gap:1rem"><img src="../logo-sm.png"/> Hyper Admin Panel Telegram bot </h1>  
<a href='https://github.com/HyperPanelx/hyper-telegram-bot' target="_blank"><img alt='' src='https://img.shields.io/badge/Release_V1.2.3-100000?style=flat&logo=&logoColor=3178C6&labelColor=333333&color=333333'/></a>

## Tech

<a href='https://nodejs.org/en' target="_blank"><img alt='nodedotjs' src='https://img.shields.io/badge/Node_js v16-100000?style=flat&logo=nodedotjs&logoColor=339933&labelColor=333333&color=333333'/></a>
<a href='https://expressjs.com/' target="_blank"><img alt='express' src='https://img.shields.io/badge/Express_js v4.18-100000?style=flat&logo=express&logoColor=339933&labelColor=333333&color=333333'/></a>
<a href='https://www.mongodb.com/' target="_blank"><img alt='mongodb' src='https://img.shields.io/badge/Mongodb-100000?style=flat&logo=mongodb&logoColor=47A248&labelColor=333333&color=333333'/></a>
## commands
```
💡 /users - لیست کاربران
💡 /online - لیست کاربران آنلاین
💡 /generate - تولید یک کاربر 
💡 /delete - حذف کاربر 
💡 /get_ip - دریافت آی پی های فعال روی اکانت 
💡 /unlock - آنلاک کردن کاربر
💡 /lock - قفل کردن کاربر
💡 /reset - ریست کردن  رمز کاربر
💡 /create - ایجاد کاربر با دسترسی ادمین
💡 /delete_admin - حذف کاربر ادمین
💡 /referral_token - دریافت توکن معرفی
💡 /change_multi -  تغییر کاربران همزمان اکانت
💡 /get_transaction -  دریافت تراکنش با شماره سفارش
💡 /show_ticket -  مشاهده تیکت های فعال
💡 /answer_ticket -  پاسخ به تیکت
💡 /add_paypal - اضافه کردن توکن زرین پال
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
## Running Server

Start the server on `http://localhost:3000`

```bash
npm run start
```
