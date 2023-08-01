require('dotenv').config()
const adminModel = require("../models/Admin");
const {fourQuestion,resetAllStates}=require('./states')
const {fourAnswers,resetAllAnswers}=require('./answers')
const f = require("node-fetch");
//// server
const serverData={
    ip:null,
    token:null
}


const urlEncode = (obj) => {
    const toArray=Object.entries(obj);
    const url=new URLSearchParams();
    toArray.forEach(item=>{
        url.append(item[0],item[1])
    })
    return url
}
const validateServer =async (ip,username,password,port) => {
    const userInfo={
        username,password
    }
    try {
        const sendValidationRequest=await f(`http://${ip}:${port}/token`,{
            method:'POST',
            body:urlEncode(userInfo),
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        })
        const response=await sendValidationRequest.json();
        const token=response.access_token ? response.access_token : response.data.access_token;
        return  token ? token : false;
    }catch (err) {
        return  false;
    }
}
const addServerProcess = async (ctx,txt) => {

    if(fourQuestion.second){
        fourQuestion.second=false
        /// ip
        fourAnswers.first=txt

        await ctx.reply('Enter admin username:')
    }else if(fourQuestion.third){
        fourQuestion.third=false
        // username
        fourAnswers.second=txt

        await ctx.reply('Enter admin password:')
    }else if(fourQuestion.fourth){
        fourQuestion.fourth=false
        // password
        fourAnswers.third=txt

        await ctx.reply('Enter Api port:\n⚠️Note: if you dont know the port enter 6655, otherwise enter port')
    } else if(fourAnswers.first && fourAnswers.second && fourAnswers.third && !fourQuestion.first && !fourQuestion.second && !fourQuestion.third && !fourQuestion.fourth){
        /// port
        fourAnswers.fourth=txt;
        const access_token=await validateServer(fourAnswers.first,fourAnswers.second,fourAnswers.third,fourAnswers.fourth);
        if(access_token){
            await ctx.reply('✅ Server is valid and authenticated! enter /start to restart bot.');
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{
                server:`${fourAnswers.first}:${fourAnswers.fourth}`,
                token:access_token
            });
        }else{
            await ctx.reply('❌ Server is invalid and unavailable! enter /start to restart bot.');
        }
        resetAllStates()
        resetAllAnswers()
    }
}

module.exports={
    serverData,addServerProcess
}