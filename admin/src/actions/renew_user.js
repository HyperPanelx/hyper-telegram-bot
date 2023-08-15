const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getTwoQuestionState}=require('../utils/states')


bot.action('renew_user',async (ctx)=>{
    await commandValidation(async ()=>{
        const twoQuestionState=getTwoQuestionState(ctx.chat.id);
        twoQuestionState.key='renew_user'
        twoQuestionState.second=true
        await ctx.reply('نام کاربری را وارد نمایید:')
    },ctx)
})

