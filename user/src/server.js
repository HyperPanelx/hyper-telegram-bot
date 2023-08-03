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
app.use('/verify',verifyRoute)
app.use('/transactions',transactionsRoute)


/////// bot commands
const start=require('./commands/start')


app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`)
    database.init()
    bot.init()
})
