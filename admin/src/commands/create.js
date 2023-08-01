const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {threeQuestion}=require('../utils/states')



bot.command('create',async (ctx)=>{
    await commandValidation(async ()=>{
        threeQuestion.key='create_admin'
        threeQuestion.second=true
        threeQuestion.third=true
        await ctx.reply('Enter username:')
    },ctx)

})