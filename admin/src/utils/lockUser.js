const {lockUser, generateCommands}=require('./utils')
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')

const lockUserProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswerState=getOneAnswersState(ctx.chat.id);
  if(oneQuestionState&&oneQuestionState.first){
      /// username
      oneAnswerState.first=txt
      const isDeleted=await lockUser(ctx,oneAnswerState.first);
      if(isDeleted){
          await ctx.reply(`✅ اکانت با موفقیت قفل شد.`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    lockUserProcess
}