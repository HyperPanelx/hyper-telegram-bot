const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const { getOneQuestionState}=require('../utils/states')



bot.action('delete_admin',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='delete_admin'
        oneQuestionState.first=true
        await ctx.reply('نام کاربری را وارد نمایید:')
    },ctx)
})