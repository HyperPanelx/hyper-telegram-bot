const {threeQuestion,resetAllStates}=require('./states')
const {threeAnswers,resetAllAnswers}=require('./answers')
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
    if(threeQuestion.third){
        threeQuestion.third=false
        /// username
        threeAnswers.second=txt
        ctx.reply('Enter admin password:')
    }else if(threeAnswers.first && threeAnswers.second && !threeQuestion.first && !threeQuestion.second && !threeQuestion.third){
        /// password
        threeAnswers.third=txt
        const new_token=await validateServer(threeAnswers.first,threeAnswers.second,threeAnswers.third);
        if(new_token){
            const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
            const adminServers=[...getAdmin.server];
            const changedTokenServers=adminServers.map(item=>{
                if(item.ip===threeAnswers.first){
                    return {ip:threeAnswers.first,token:new_token}
                }else{
                    return item
                }
            });
            await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{server:changedTokenServers});
            ctx.reply('✅ Authentication was successful! enter /start to continue!')
        }else{
            ctx.reply('❌ Authentication failed! enter /start to try again!')
        }
        resetAllAnswers();
        resetAllStates();

    }
}


module.exports={startAuthProcess}