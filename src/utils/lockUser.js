const {lockUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {bot} = require("../bot.config");

const lockUserData={
    state:false,
    username:''
}
const resetlockData = () => {
    lockUserData.state=false
    lockUserData.username=''
}


const lockUserProcess = async (chatId,txt,userId) => {
  if(lockUserData.state){
      lockUserData.username=txt
      const isDeleted=await lockUser(serverData.ip,serverData.token,lockUserData.username);
      if(isDeleted){
          await bot.telegram.sendMessage(chatId,`✅ user locked successfully!`)
          await generateCommands(chatId,userId)
      }else{
          await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
      }
      resetlockData()
  }
}

module.exports= {
    lockUserProcess,lockUserData
}