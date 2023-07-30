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
const users=require('./commands/users')
const start=require('./commands/start')

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
    database.init()
    bot.init()
})
