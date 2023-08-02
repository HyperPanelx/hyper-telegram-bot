const adminModel=require('../models/Admin')
const {generateCommands} = require("./utils");
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')


const addPaypalProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswersState=getOneAnswersState(ctx.chat.id);

  if(oneQuestionState&&oneQuestionState.first){
      /// link
      oneAnswersState.first=txt
        adminModel.
        findOneAndUpdate({bot_id:ctx.from.id},{paypal_link:oneAnswersState.first}).
        then(async ()=>{
            await ctx.reply(`✅ link added successfully!`)
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