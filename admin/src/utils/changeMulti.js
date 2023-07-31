require('dotenv').config()

//////////////////////
const {bot} = require("../bot.config");
const {changeMulti,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const changeMultiUserStates={};
const changeMultiUserAnswers={
    username:'',
    new_multi:0
};

const changeMultiState = (chatId) => {
    let userData = changeMultiUserStates[chatId]
    if (!userData) {
        userData = {
            waitingForUsername: false,
            waitingForNewMulti: false,
        }
        changeMultiUserStates[chatId] = userData
    }
    return userData
}
const resetChangeMultiUserData = (chatId) => {
    const userData = changeMultiState(chatId)
    userData.waitingForUsername = false
    userData.waitingForNewMulti = false
    changeMultiUserAnswers.username=''
    changeMultiUserAnswers.new_multi=0
}
const changeMultiProcess = async (chatId,txt,userId) => {
    const changeMultiUserStatus=changeMultiState(chatId);
    if(changeMultiUserStatus && changeMultiUserStatus.waitingForNewMulti){
        changeMultiUserStatus.waitingForNewMulti=false
        changeMultiUserAnswers.username=txt
        await bot.telegram.sendMessage(chatId,'Enter new multi:');
    }else if( changeMultiUserAnswers.username && !changeMultiUserStatus.waitingForUsername && !changeMultiUserStatus.waitingForNewMulti){
        changeMultiUserAnswers.new_multi=txt
        const isCreated=await changeMulti(serverData.ip,serverData.token,changeMultiUserAnswers.username,changeMultiUserAnswers.new_multi);
        if(isCreated){
            await bot.telegram.sendMessage(chatId,`✅ user multi changed successfully!`);
            await generateCommands(chatId,userId);
        }else{
            await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!');
        }
        resetChangeMultiUserData()
    }
}

module.exports={
    changeMultiProcess,changeMultiState
}

