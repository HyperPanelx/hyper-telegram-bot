require('dotenv').config()
const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const app=express()
const database=require('./database')
const bot=require('./bot.config')
///////
app.use(bodyParser.json());
app.use(cors())


///// api routes
const verifyRoute=require('../src/routes/verify');
const transactionsRoute=require('../src/routes/transactions');
const cancelRoute=require('../src/routes/cancel');
app.use('/verify',verifyRoute)
app.use('/transactions',transactionsRoute)
app.use('/cancel',cancelRoute)

/////// actions
const buy_account=require('./actions/buy_account')
const show_account=require('./actions/show_account')
const show_transactions=require('./actions/show_transactions')
const send_ticket=require('./actions/send_ticket')
const show_ticket=require('./actions/show_ticket')

/////// bot commands
const start=require('./commands/start')


app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`)
    database.init()
    bot.init()
})
