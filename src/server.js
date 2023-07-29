require('dotenv').config()
const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const { query,body ,validationResult,matchedData} = require('express-validator');
const app=express()
///////
app.use(bodyParser.json());
app.use(cors())






app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`))
