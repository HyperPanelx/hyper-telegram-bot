const {getIPRequest, generateCommands}=require('./utils')
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')


const getIPProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id)
    const oneAnswersState=getOneAnswersState(ctx.chat.id)
  if(oneQuestionState&&oneQuestionState.first){
      /// username
      oneAnswersState.first=txt
      const clientIPs=await getIPRequest(ctx,oneAnswersState.first);
      if(clientIPs){
          await ctx.reply(`✅ آی پی های متصل به این اکانت:\n`+clientIPs)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    getIPProcess
}