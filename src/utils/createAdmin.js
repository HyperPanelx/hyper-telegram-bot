require('dotenv').config()

//////////////////////
const {bot} = require("../bot.config");
const {createAdmin,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const createAdminUserStates={};
const createAdminUserAnswers={
    username:'',
    pass:''
};

const userCreateAdminState = (chatId) => {
    let userData = createAdminUserStates[chatId]
    if (!userData) {
        userData = {
            waitingForUsername: false,
            waitingForPass: false,
        }
        createAdminUserStates[chatId] = userData
    }
    return userData
}
const createAdminUserData = (chatId) => {
    const userData = userCreateAdminState(chatId)
    userData.waitingForUsername = false
    userData.waitingForPass = false
    createAdminUserAnswers.pass=''
    createAdminUserAnswers.username=''
}
const createAdminProcess = async (chatId,txt,userId) => {
    const createAdminUserStatus=userCreateAdminState(chatId);
    if(createAdminUserStatus && createAdminUserStatus.waitingForPass){
        createAdminUserStatus.waitingForPass=false
        createAdminUserAnswers.username=txt
        await bot.telegram.sendMessage(chatId,'Enter new password:');
    }else if( createAdminUserAnswers.username && !createAdminUserStatus.waitingForUsername && !createAdminUserStatus.waitingForPass){
        createAdminUserAnswers.pass=txt
        const isCreated=await createAdmin(serverData.ip,serverData.token,createAdminUserAnswers.username,createAdminUserAnswers.pass);
        if(isCreated){
            await bot.telegram.sendMessage(chatId,`✅ admin user created successfully!`);
            await generateCommands(chatId,userId);
        }else{
            await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!');
        }
        createAdminUserData()
    }
}

module.exports={
    createAdminProcess,userCreateAdminState
}

