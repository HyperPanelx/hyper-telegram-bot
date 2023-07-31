require('dotenv').config()
const {bot} = require("../bot.config");
const adminModel = require("../models/Admin");
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
    password:'',
    port:''
};

const userAddServerState = (chatId) => {
    let userData = addServerStates[chatId]
    if (!userData) {
        userData = {
            waitingForIP: false,
            waitingForUsername: false,
            waitingForPassword: false,
            waitingForPort: false,
        }
        addServerStates[chatId] = userData
    }
    return userData
}

const resetAddServerData = (chatId) => {
    const userData = userAddServerState(chatId)
    userData.waitingForIP = false
    userData.waitingForUsername = false
    userData.waitingForPassword = false
    userData.waitingForPort = false
    addServerAnswers.ip=0
    addServerAnswers.password=''
    addServerAnswers.username=''
    addServerAnswers.port=''
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
    }else if(addServerStatus.waitingForPort){
        addServerAnswers.password=txt
        addServerStatus.waitingForPort=false
        await bot.telegram.sendMessage(chatId,'Enter Api port:\n⚠️Note: if you dont know the port enter 6655, otherwise enter port')
    } else if(addServerAnswers.ip && addServerAnswers.username && addServerAnswers.password && !addServerStatus.waitingForIP && !addServerStatus.waitingForUsername && !addServerStatus.waitingForPassword && !addServerStatus.waitingForPort){
        addServerAnswers.port=txt;
        const access_token=await validateServer(addServerAnswers.ip,addServerAnswers.username,addServerAnswers.password,addServerAnswers.port);
        if(access_token){
            await bot.telegram.sendMessage(chatId,'✅ Server is valid and authenticated! enter /start to restart bot.');
            await adminModel.findOneAndUpdate({bot_id:userId},{
                server:`${addServerAnswers.ip}:${addServerAnswers.port}`,
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