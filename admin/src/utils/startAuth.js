const {resetAllStates, getThreeQuestionState}=require('./states')
const {resetAllAnswers, getThreeAnswersState}=require('./answers')
const f = require("node-fetch");
const {urlEncode}=require('./utils')
const adminModel=require('../models/Admin')

const validateServer =async (ip,username,password) => {
    const userInfo={
        username,password
    }
    try {
        const sendValidationRequest=await f(`http://${ip}/token`,{
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

const startAuthProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);

    if(threeQuestionState&&threeQuestionState.third){
        threeQuestionState.third=false
        /// username
        threeAnswersState.second=txt
        ctx.reply('نام کاربری ادمین را وارد نمایید:')
    }else if(threeAnswersState.first && threeAnswersState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
        /// password
        threeAnswersState.third=txt
        const new_token=await validateServer(threeAnswersState.first,threeAnswersState.second,threeAnswersState.third);
        if(new_token){
            const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
            const adminServers=[...getAdmin.server];
            const changedTokenServers=adminServers.map(item=>{
                if(item.ip===threeAnswersState.first){
                    return {ip:threeAnswersState.first,token:new_token}
                }else{
                    return item
                }
            });
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{server:changedTokenServers});
            ctx.reply('✅ احرازهویت موفقیت آمیز بود. جهت ادامه کار کامند start/ را وارد نمایید.')
        }else{
            ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id);

    }
}


module.exports={startAuthProcess}