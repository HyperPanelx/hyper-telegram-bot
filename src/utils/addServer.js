require('dotenv').config()
const {bot} = require("../bot.config");
const userModel = require("../models/User");
const f = require("node-fetch");
//// server
const serverData={
    ip:null,
    token:null
}
const addServerStates={};
const addServerAnswers={
    ip:0,
    username:'',
    password:''
};

const userAddServerState = (chatId) => {
    let userData = addServerStates[chatId]
    if (!userData) {
        userData = {
            waitingForIP: false,
            waitingForUsername: false,
            waitingForPassword: false,
        }
        addServerStates[chatId] = userData
    }
    return userData
}

const resetAddServerData = (chatId) => {
    const userData = userAddServerState(chatId)
    userData.waitingForCity = false
    userData.waitingForWeather = false
    userData.waitingForTime = false
    addServerAnswers.ip=0
    addServerAnswers.password=''
    addServerAnswers.username=''
}
const urlEncode = (obj) => {
    const toArray=Object.entries(obj);
    const url=new URLSearchParams();
    toArray.forEach(item=>{
        url.append(item[0],item[1])
    })
    return url
}
const validateServer =async (ip,username,password) => {
    const port=process.env.API_PORT || 6655;
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
const addServerProcess = async (chatId,txt,userId) => {
    const addServerStatus=userAddServerState(chatId);
    if(addServerStatus && addServerStatus.waitingForUsername){
        addServerStatus.waitingForUsername=false
        addServerAnswers.ip=txt
        await bot.telegram.sendMessage(chatId,'Enter admin username:')
    }else if(addServerStatus.waitingForPassword){
        addServerStatus.waitingForPassword=false
        addServerAnswers.username=txt
        await bot.telegram.sendMessage(chatId,'Enter admin password:')
    }else if(addServerAnswers.ip && addServerAnswers.username && !addServerStatus.waitingForIP && !addServerStatus.waitingForUsername && !addServerStatus.waitingForPassword){
        addServerAnswers.password=txt;
        const access_token=await validateServer(addServerAnswers.ip,addServerAnswers.username,addServerAnswers.password);
        if(access_token){
            await bot.telegram.sendMessage(chatId,'✅ Server is valid and authenticated! enter /start to restart bot.');
            await userModel.findOneAndUpdate({bot_id:userId},{
                server:addServerAnswers.ip,
                token:access_token
            })
        }else{
            await bot.telegram.sendMessage(chatId,'❌ Server is invalid and unavailable! enter /start to restart bot.');
        }
        resetAddServerData(chatId)

    }
}

module.exports={
    resetAddServerData,addServerStates,serverData,userAddServerState,addServerProcess
}