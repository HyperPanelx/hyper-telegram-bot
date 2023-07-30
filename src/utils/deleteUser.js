const {deleteUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {bot} = require("../bot.config");

const deleteUserData={
    state:false,
    username:''
}
const resetDeleteData = () => {
  deleteUserData.state=false
  deleteUserData.username=false
}


const deleteUserProcess = async (chatId,txt,userId) => {
  if(deleteUserData.state){
      deleteUserData.username=txt
      const isDeleted=await deleteUser(serverData.ip,serverData.token,deleteUserData.username);
      if(isDeleted){
          await bot.telegram.sendMessage(chatId,`✅ user deleted successfully!`)
          await generateCommands(chatId,userId)
      }else{
          await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
      }
      resetDeleteData()
  }
}

module.exports= {
  deleteUserProcess,deleteUserData
}