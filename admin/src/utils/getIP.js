const {getIPRequest, generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {oneQuestion,resetAllStates}=require('./states')
const {oneAnswer,resetAllAnswers}=require('./answers')


const getIPProcess = async (ctx,txt) => {
  if(oneQuestion.first){
      /// username
      oneAnswer.first=txt
      const clientIPs=await getIPRequest(serverData.ip,serverData.token,oneAnswer.first);
      if(clientIPs){
          await ctx.reply(`✅ connected client ips are:\n`+clientIPs)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ operation failed! enter /start to try again!')
      }
      resetAllAnswers();
      resetAllStates();
  }
}

module.exports= {
    getIPProcess
}