const {getIPRequest, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')


const getIPProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id)
    const oneAnswersState=getOneAnswersState(ctx.chat.id)
  if(oneQuestionState&&oneQuestionState.first){
      /// username
      oneAnswersState.first=txt
      const clientIPs=await getIPRequest(serverData.ip,serverData.token,oneAnswersState.first);
      if(clientIPs){
          await ctx.reply(`✅ connected client ips are:\n`+clientIPs)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    getIPProcess
}