const {deleteAdminUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {oneQuestion,resetAllStates}=require('../utils/states')
const {oneAnswer,resetAllAnswers}=require('../utils/answers')


const deleteAdminUserProcess = async (ctx,txt) => {
  if(oneQuestion.first){
      /// username
      oneAnswer.first=txt
      const isDeleted=await deleteAdminUser(serverData.ip,serverData.token,oneAnswer.first);
      if(isDeleted){
          await ctx.reply(`✅ admin user deleted successfully!`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers()
      resetAllStates()
  }
}

module.exports= {
    deleteAdminUserProcess
}