const {unlockUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {bot} = require("../bot.config");

const unlockUserData={
    state:false,
    username:''
}
const resetUnlockData = () => {
    unlockUserData.state=false
    unlockUserData.username=''
}


const unlockUserProcess = async (chatId,txt,userId) => {
  if(unlockUserData.state){
      unlockUserData.username=txt
      const isDeleted=await unlockUser(serverData.ip,serverData.token,unlockUserData.username);
      if(isDeleted){
          await bot.telegram.sendMessage(chatId,`✅ user unlocked successfully!`)
          await generateCommands(chatId,userId)
      }else{
          await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
      }
      resetUnlockData()
  }
}

module.exports= {
    unlockUserProcess,unlockUserData
}