require('dotenv').config()
const adminModel = require("../models/Admin");
const {resetAllStates,getFiveQuestionState}=require('./states')
const {resetAllAnswers,getFiveAnswersState}=require('./answers')
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
    const fiveQuestionState=getFiveQuestionState(ctx.chat.id);
    const fiveAnswerState=getFiveAnswersState(ctx.chat.id);

    if(fiveQuestionState && fiveQuestionState.second){
        fiveQuestionState.second=false
        /// ip
        fiveAnswerState.first=txt

        await ctx.reply('نام کاربری ادمین را وارد نمایید:')
    }else if(fiveQuestionState.third){
        fiveQuestionState.third=false
        // username
        fiveAnswerState.second=txt

        await ctx.reply('پسورد ادمین را وارد نمایید:')
    }else if(fiveQuestionState.fourth){
        fiveQuestionState.fourth=false
        // password
        fiveAnswerState.third=txt

        await ctx.reply('پورت api  را وارد نمایید:\n⚠️نکته: در صورتی که در این باره اطلاعی ندارید مقدار 6655 راوارد کنید.')
    } else if(fiveQuestionState.fifth){
        fiveQuestionState.fifth=false
        // api port
        fiveAnswerState.fourth=txt
        await ctx.reply('پورت ssh  را وارد نمایید:\n⚠️نکته:  در صورت اشتباه بودن این مقدار کاربران با مشکل مواجد خواهند شد.')

    }else if(fiveAnswerState.first && fiveAnswerState.second && fiveAnswerState.third && fiveAnswerState.fourth && !fiveQuestionState.first && !fiveQuestionState.second && !fiveQuestionState.third && !fiveQuestionState.fourth && !fiveQuestionState.fifth){
        /// ssh port
        fiveAnswerState.fifth=txt;

        const access_token=await validateServer(fiveAnswerState.first,fiveAnswerState.second,fiveAnswerState.third,fiveAnswerState.fourth);
        if(access_token){
            await ctx.reply('✅ عملیات احرازهویت سرور با موفقیت انجام شد. جهت ادامه کار کامند start/ را وارد نمایید.');
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{
                    server:{
                        ip:`${fiveAnswerState.first}:${fiveAnswerState.fourth}`,
                        token:access_token,
                        ssh_port:fiveAnswerState.fifth
                    }
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