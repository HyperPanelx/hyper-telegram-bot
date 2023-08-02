const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getTwoQuestionState}=require('../utils/states')


bot.command('change_multi',async (ctx)=>{
    await commandValidation(async ()=>{
        const twoQuestionState=getTwoQuestionState(ctx.chat.id);
        twoQuestionState.key='change_multi'
        twoQuestionState.second=true
        await ctx.reply('Enter username:')
    },ctx)
})