require('dotenv').config()
const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const { query,body ,validationResult,matchedData} = require('express-validator');
const app=express()
const database=require('./database')
const bot=require('./bot.config')
///////
app.use(bodyParser.json());
app.use(cors())




const buy=require('./commands/buy')
const accounts=require('./commands/accounts')
const transactions=require('./commands/transactions')
const start=require('./commands/start')

app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`)
    database.init()
    bot.init()
})
