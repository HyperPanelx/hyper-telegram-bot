require('dotenv').config()

//////////////////////
const {bot} = require("../bot.config");
const {generateUser,generateCommands,resetPassword}=require('./utils')
const {serverData} = require("./addServer");
const resetPassUserStates={};
const resetPassUserAnswers={
    username:'',
    new_pass:''
};

const userResetPassState = (chatId) => {
    let userData = resetPassUserStates[chatId]
    if (!userData) {
        userData = {
            waitingForUsername: false,
            waitingForNewPass: false,
        }
        resetPassUserStates[chatId] = userData
    }
    return userData
}
const resetPassUserData = (chatId) => {
    const userData = userResetPassState(chatId)
    userData.waitingForUsername = false
    userData.waitingForNewPass = false
    resetPassUserAnswers.new_pass=''
    resetPassUserAnswers.username=''
}
const resetUserPassProcess = async (chatId,txt,userId) => {
    const resetPassUserStatus=userResetPassState(chatId);

    if(resetPassUserStatus && resetPassUserStatus.waitingForNewPass){
        resetPassUserStatus.waitingForNewPass=false
        resetPassUserAnswers.username=txt
        await bot.telegram.sendMessage(chatId,'Enter new password:');

    }else if( resetPassUserAnswers.username && !resetPassUserStatus.waitingForUsername && !resetPassUserStatus.waitingForNewPass){
        resetPassUserAnswers.new_pass=txt
        const isPasswordReset=await resetPassword(serverData.ip,serverData.token,resetPassUserAnswers.username,resetPassUserAnswers.new_pass);
        if(isPasswordReset){
            await bot.telegram.sendMessage(chatId,`✅ user's password changed successfully!`)
            await generateCommands(chatId,userId)
        }else{
            await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
        }
        resetPassUserData()
    }
}

module.exports={
    resetUserPassProcess,userResetPassState
}

