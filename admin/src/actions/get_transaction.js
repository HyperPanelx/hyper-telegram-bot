const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getOneQuestionState}=require('../utils/states')


bot.action('get_transaction',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='get_transaction'
        oneQuestionState.first=true
        await ctx.reply('شماره سفارش را وارد نمایید:')
    },ctx)
})

