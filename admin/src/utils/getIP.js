const {getIPRequest}=require('./utils')
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')


const getIPProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id)
    const oneAnswersState=getOneAnswersState(ctx.chat.id)
  if(oneQuestionState&&oneQuestionState.first){
      /// username
      oneAnswersState.first=txt
      const clientIPs=await getIPRequest(ctx,oneAnswersState.first);
      if(clientIPs.length>0){
          await ctx.reply(`✅ آی پی های متصل به این اکانت:\n`+clientIPs,{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          })
      }else if(clientIPs.length===0){
          await ctx.reply(`❌ اطلاعاتی یافت نشد.\n`,{
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
    getIPProcess
}