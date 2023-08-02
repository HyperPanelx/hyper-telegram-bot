const {deleteAdminUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {resetAllStates}=require('../utils/states')
const {resetAllAnswers}=require('../utils/answers')
const {getOneQuestionState} = require("./states");
const {getOneAnswersState} = require("./answers");


const deleteAdminUserProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswerState=getOneAnswersState(ctx.chat.id);
  if(oneQuestionState&&oneQuestionState.first){
      /// username
      oneAnswerState.first=txt
      const isDeleted=await deleteAdminUser(serverData.ip,serverData.token,oneAnswerState.first);
      if(isDeleted){
          await ctx.reply(`✅ admin user deleted successfully!`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers(ctx.chat.id)
      resetAllStates(ctx.chat.id)
  }
}

module.exports= {
    deleteAdminUserProcess
}