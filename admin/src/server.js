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

//// routes
const create=require('./commands/create')
const del=require('./commands/delete')
const reset=require('./commands/reset')
const online=require('./commands/online')
const generate=require('./commands/generate')
const unlock=require('./commands/unlock')
const lock=require('./commands/lock')
const ip=require('./commands/ip')
const show_ticket=require('./commands/show_ticket')
const answer_ticket=require('./commands/answer_ticket')
const get_transaction=require('./commands/get_transaction')
const deleteAdmin=require('./commands/deleteAdmin')
const referral_token=require('./commands/referral_token')
const changeMulti=require('./commands/changeMulti')
const paypal=require('./commands/paypal')
const users=require('./commands/users')
const start=require('./commands/start')

app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`)
    database.init()
    bot.init()
})
