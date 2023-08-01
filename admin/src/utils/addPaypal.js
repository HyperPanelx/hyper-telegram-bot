const adminModel=require('../models/Admin')
const {generateCommands} = require("./utils");
const {oneQuestion,resetAllStates}=require('./states')
const {oneAnswer,resetAllAnswers}=require('./answers')


const addPaypalProcess = async (ctx,txt) => {
  if(oneQuestion.first){
      /// link
      oneAnswer.first=txt
        adminModel.
        findOneAndUpdate({bot_id:ctx.from.id},{paypal_link:oneAnswer.first}).
        then(async ()=>{
            await ctx.reply(`✅ link added successfully!`)
            await generateCommands(ctx)
        }).catch(async ()=>{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        })
      resetAllAnswers();
      resetAllStates();
  }
}

module.exports= {
    addPaypalProcess
}