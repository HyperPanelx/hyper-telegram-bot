const {deleteUser}=require('./utils')
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')

const deleteUserProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswerState=getOneAnswersState(ctx.chat.id);

  if(oneQuestionState && oneQuestionState.first){
      // username
      oneAnswerState.first=txt
      const isDeleted=await deleteUser(ctx,oneAnswerState.first);
      if(isDeleted){
          await ctx.reply(`✅ کاربر با موفقیت حذف شد`,{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          })
      }else{
          await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.',{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          })
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
  deleteUserProcess
}