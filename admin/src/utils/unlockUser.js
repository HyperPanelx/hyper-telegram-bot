const {unlockUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {oneQuestion,resetAllStates}=require('./states');
const {oneAnswer,resetAllAnswers}=require('./answers');





const unlockUserProcess = async (ctx,txt) => {
  if(oneQuestion.first){
      //// username
      oneAnswer.first=txt
      const isDeleted=await unlockUser(serverData.ip,serverData.token,oneAnswer.first);
      if(isDeleted){
          await ctx.reply(`✅ user unlocked successfully!`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers();
      resetAllStates();
  }
}

module.exports= {
    unlockUserProcess
}