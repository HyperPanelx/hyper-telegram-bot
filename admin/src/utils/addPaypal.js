const adminModel=require('../models/Admin')
const {generateCommands} = require("./utils");
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')


const addPaypalProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswersState=getOneAnswersState(ctx.chat.id);
  if(oneQuestionState&&oneQuestionState.first){
      /// token
      oneAnswersState.first=txt
        adminModel.
        findOneAndUpdate({bot_id:ctx.from.id},{zarinpal_token:oneAnswersState.first}).
        then(async ()=>{
            await ctx.reply(`✅ token added successfully!`)
            await generateCommands(ctx)
        }).catch(async ()=>{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        })
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    addPaypalProcess
}