const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {twoQuestion}=require('../utils/states')


bot.command('change_multi',async (ctx)=>{
    await commandValidation(async ()=>{
        twoQuestion.key='change_multi'
        twoQuestion.second=true
        await ctx.reply('Enter username:')
    },ctx)
})