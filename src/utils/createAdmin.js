require('dotenv').config()

//////////////////////
const {bot} = require("../bot.config");
const {createAdmin,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const createAdminUserStates={};
const createAdminUserAnswers={
    username:'',
    pass:'',
    role:0
};

const userCreateAdminState = (chatId) => {
    let userData = createAdminUserStates[chatId]
    if (!userData) {
        userData = {
            waitingForUsername: false,
            waitingForPass: false,
            waitingForRole: false,
        }
        createAdminUserStates[chatId] = userData
    }
    return userData
}
const createAdminUserData = (chatId) => {
    const userData = userCreateAdminState(chatId)
    userData.waitingForUsername = false
    userData.waitingForPass = false
    userData.waitingForRole = false
    createAdminUserAnswers.pass=''
    createAdminUserAnswers.username=''
    createAdminUserAnswers.role=0
}
const createAdminProcess = async (chatId,txt,userId) => {
    const createAdminUserStatus=userCreateAdminState(chatId);
    if(createAdminUserStatus && createAdminUserStatus.waitingForPass){
        createAdminUserStatus.waitingForPass=false
        createAdminUserAnswers.username=txt
        await bot.telegram.sendMessage(chatId,'Enter new password:');
    }else if(createAdminUserStatus.waitingForRole){
        createAdminUserStatus.waitingForRole=false
        createAdminUserAnswers.pass=txt
        await bot.telegram.sendMessage(chatId,'Enter role:\n0 = full access');
    }else if( createAdminUserAnswers.username && createAdminUserAnswers.pass && !createAdminUserStatus.waitingForUsername && !createAdminUserStatus.waitingForPass && !createAdminUserStatus.waitingForRole){
        createAdminUserAnswers.role=txt
        const isCreated=await createAdmin(serverData.ip,serverData.token,createAdminUserAnswers.username,createAdminUserAnswers.pass,createAdminUserAnswers.role);
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

