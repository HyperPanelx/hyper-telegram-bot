const {deleteUser, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')

const deleteUserProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswerState=getOneAnswersState(ctx.chat.id);

  if(oneQuestionState && oneQuestionState.first){
      // username
      oneAnswerState.first=txt
      const isDeleted=await deleteUser(serverData.ip,serverData.token,oneAnswerState.first);
      if(isDeleted){
          await ctx.reply(`✅ user deleted successfully!`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
  deleteUserProcess
}