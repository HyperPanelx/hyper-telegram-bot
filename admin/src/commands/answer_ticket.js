const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getTwoQuestionState}=require('../utils/states')


bot.command('answer_ticket',async (ctx)=>{
    await commandValidation(async ()=>{
        const twoQuestionState=getTwoQuestionState(ctx.chat.id);
        twoQuestionState.key='answer_ticket'
        twoQuestionState.second=true
        await ctx.reply('شماره تیکت را وارد نمایید:')
    },ctx)
})

