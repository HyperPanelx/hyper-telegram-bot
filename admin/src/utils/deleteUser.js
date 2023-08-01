const {deleteUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {oneQuestion,resetAllStates}=require('./states')
const {resetAllAnswers,oneAnswer}=require('./answers')


const deleteUserProcess = async (ctx,txt) => {
  if(oneQuestion.first){
      // username
      oneAnswer.first=txt
      const isDeleted=await deleteUser(serverData.ip,serverData.token,oneAnswer.first);
      if(isDeleted){
          await ctx.reply(`✅ user deleted successfully!`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers();
      resetAllStates();
  }
}

module.exports= {
  deleteUserProcess
}