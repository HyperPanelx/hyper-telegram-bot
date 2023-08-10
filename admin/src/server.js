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

//// actions
const startAction=require('./actions/start')
const show_menu=require('./actions/show_menu')
const show_multi=require('./actions/show_multi')
const add_multi=require('./actions/add_multi')
const create=require('./actions/create')
const del=require('./actions/delete')
const reset=require('./actions/reset')
const online=require('./actions/online')
const generate=require('./actions/generate')
const unlock=require('./actions/unlock')
const lock=require('./actions/lock')
const ip=require('./actions/ip')
const show_ticket=require('./actions/show_ticket')
const answer_ticket=require('./actions/answer_ticket')
const get_transaction=require('./actions/get_transaction')
const deleteAdmin=require('./actions/deleteAdmin')
const referral_token=require('./actions/referral_token')
const changeMulti=require('./actions/changeMulti')
const paypal=require('./actions/paypal')
const users=require('./actions/users')

//// commands
const start=require('./commands/start')

app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`)
    database.init()
    bot.init()
})
