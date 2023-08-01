const {bot}=require('../bot.config');
const {threeQuestion}=require('../utils/states')
const {commandValidation}=require('../utils/utils')


bot.command('generate',async (ctx)=>{
    await commandValidation(async ()=>{
        threeQuestion.key='generate'
        threeQuestion.second=true
        threeQuestion.third=true
        await ctx.reply('Enter Multi user:')
    },ctx)
})

