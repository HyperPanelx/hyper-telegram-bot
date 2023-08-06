require('dotenv').config()
const adminModel = require("../models/Admin");
const {resetAllStates,getFourQuestionState}=require('./states')
const {resetAllAnswers,getFourAnswersState}=require('./answers')
const f = require("node-fetch");

const serverData = {}
const getServerData = (chatId) => {
    let userData = serverData[chatId];
    if (!userData) {
        userData = {
            ip:'',
            token:''
        }
        serverData[chatId] = userData
    }
    return userData
}
const resetServerData = (chatId) => {
    const serverData=getServerData(chatId);
    serverData.ip=''
    serverData.token=''
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

        await ctx.reply('نام کاربری ادمین را وارد نمایید:')
    }else if(fourQuestionState.third){
        fourQuestionState.third=false
        // username
        fourAnswerState.second=txt

        await ctx.reply('پسورد ادمین را وارد نمایید:')
    }else if(fourQuestionState.fourth){
        fourQuestionState.fourth=false
        // password
        fourAnswerState.third=txt

        await ctx.reply('پورت api  را وارد نمایید:\n⚠️نکته: در صورتی که در این باره اطلاعی ندارید مقدار 6655 راوارد کنید.')
    } else if(fourAnswerState.first && fourAnswerState.second && fourAnswerState.third && !fourQuestionState.first && !fourQuestionState.second && !fourQuestionState.third && !fourQuestionState.fourth){
        /// port
        fourAnswerState.fourth=txt;
        const access_token=await validateServer(fourAnswerState.first,fourAnswerState.second,fourAnswerState.third,fourAnswerState.fourth);
        if(access_token){
            await ctx.reply('✅ عملیات احرازهویت سرور با موفقیت انجام شد. جهت ادامه کار کامند start/ را وارد نمایید.');
            const adminData=await adminModel.findOne({bot_id:ctx.from.id});
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{
                server: [
                    ...adminData.server,
                    {ip:`${fourAnswerState.first}:${fourAnswerState.fourth}`,token:access_token}
                ]
               },
            );
        }else{
            await ctx.reply('❌ عملیات احرازهویت با شکست مواجه شد. برای تلاش مجدد کامند start/ را وارد نمایید. ');
        }
        resetAllStates(ctx.chat.id)
        resetAllAnswers(ctx.chat.id)
    }
}

module.exports={
    serverData,addServerProcess,getServerData,resetServerData
}