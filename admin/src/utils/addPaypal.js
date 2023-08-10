const adminModel=require('../models/Admin')
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
            await ctx.reply(`✅ توکن با موفقیت ثبت شد!`,{
                reply_markup: {
                   inline_keyboard: [
                       [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                   ]
               }
            })
        }).catch(async ()=>{
            await ctx.reply('❌ عدم امکان برقراری ارتباط با دیتابیس.',{
                reply_markup: {
                   inline_keyboard: [
                       [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                   ]
               }
            })
        })
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    addPaypalProcess
}