const {bot}=require('../bot.config');
const {getThreeQuestionState}=require('../utils/states')
const {commandValidation}=require('../utils/utils')


bot.command('generate',async (ctx)=>{
    await commandValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id)
        threeQuestionState.key='generate'
        threeQuestionState.second=true
        threeQuestionState.third=true
        await ctx.reply('Enter Multi user:')
    },ctx)
})

