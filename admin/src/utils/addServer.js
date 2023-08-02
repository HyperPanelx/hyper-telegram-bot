require('dotenv').config()
const adminModel = require("../models/Admin");
const {resetAllStates,getFourQuestionState}=require('./states')
const {resetAllAnswers,getFourAnswersState}=require('./answers')
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
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    const fourAnswerState=getFourAnswersState(ctx.chat.id);

    if(fourQuestionState && fourQuestionState.second){
        fourQuestionState.second=false
        /// ip
        fourAnswerState.first=txt

        await ctx.reply('Enter admin username:')
    }else if(fourQuestionState.third){
        fourQuestionState.third=false
        // username
        fourAnswerState.second=txt

        await ctx.reply('Enter admin password:')
    }else if(fourQuestionState.fourth){
        fourQuestionState.fourth=false
        // password
        fourAnswerState.third=txt

        await ctx.reply('Enter Api port:\n⚠️Note: if you dont know the port enter 6655, otherwise enter port')
    } else if(fourAnswerState.first && fourAnswerState.second && fourAnswerState.third && !fourQuestionState.first && !fourQuestionState.second && !fourQuestionState.third && !fourQuestionState.fourth){
        /// port
        fourAnswerState.fourth=txt;
        const access_token=await validateServer(fourAnswerState.first,fourAnswerState.second,fourAnswerState.third,fourAnswerState.fourth);
        if(access_token){
            await ctx.reply('✅ Server is valid and authenticated! enter /start to restart bot.');
            const adminData=await adminModel.findOne({bot_id:ctx.from.id});
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{
                server: [
                    ...adminData.server,
                    {ip:`${fourAnswerState.first}:${fourAnswerState.fourth}`,token:access_token}
                ]
               },
            );
        }else{
            await ctx.reply('❌ Server is invalid and unavailable! enter /start to restart bot.');
        }
        resetAllStates(ctx.chat.id)
        resetAllAnswers(ctx.chat.id)
    }
}

module.exports={
    serverData,addServerProcess
}