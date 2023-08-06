const {deleteAdminUser, generateCommands}=require('./utils')
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
      const isDeleted=await deleteAdminUser(ctx,oneAnswerState.first);
      if(isDeleted){
          await ctx.reply(`✅ کاربر ادمین با موفقیت حذف شد.`)
          await generateCommands(ctx)
      }else{
          await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
      }
      resetAllAnswers(ctx.chat.id)
      resetAllStates(ctx.chat.id)
  }
}

module.exports= {
    deleteAdminUserProcess
}