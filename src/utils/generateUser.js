require('dotenv').config()

//////////////////////
const {bot} = require("../bot.config");
const userModel = require("../models/User");
const {generateUser,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const generateUserStates={};
const addGenerateUserAnswers={
    multi:0,
    exdate:0,
    count:0
};

const userGenerateState = (chatId) => {
    let userData = generateUserStates[chatId]
    if (!userData) {
        userData = {
            waitingForMulti: false,
            waitingForExdate: false,
            waitingForCount: false,
        }
        generateUserStates[chatId] = userData
    }
    return userData
}
const resetGenerateUserData = (chatId) => {
    const userData = userGenerateState(chatId)
    userData.waitingForMulti = false
    userData.waitingForExdate = false
    userData.waitingForCount = false
}
const generateUserProcess = async (chatId,txt,userId) => {
    const generateUserStatus=userGenerateState(chatId);
    if(generateUserStatus && generateUserStatus.waitingForExdate){
        generateUserStatus.waitingForExdate=false
        addGenerateUserAnswers.multi=txt
        await bot.telegram.sendMessage(chatId,'Enter expiration date (yyyy-mm-dd):');
    }else if(generateUserStatus.waitingForCount){
        generateUserStatus.waitingForCount=false
        addGenerateUserAnswers.exdate=txt
        await bot.telegram.sendMessage(chatId,'Enter count:')
    }else if(addGenerateUserAnswers.multi && addGenerateUserAnswers.exdate && !generateUserStatus.waitingForCount && !generateUserStatus.waitingForExdate && !generateUserStatus.waitingForMulti){
        addGenerateUserAnswers.count=txt;
        const generatedUser=await generateUser(addGenerateUserAnswers.multi,addGenerateUserAnswers.exdate,addGenerateUserAnswers.count,serverData.ip,serverData.token)
        if(generatedUser){
            await bot.telegram.sendMessage(chatId,`✅ users generated successfully!\n`+generatedUser)
            await generateCommands(chatId,userId)
        }else{
            await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
        }
    }
}

module.exports={
    generateUserStates,generateUserProcess,addGenerateUserAnswers,userGenerateState
}

