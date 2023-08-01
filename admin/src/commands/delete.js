const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {oneQuestion}=require('../utils/states')


bot.command('delete',async (ctx)=>{
    await commandValidation(async ()=>{
        oneQuestion.key='delete_user'
        oneQuestion.first=true
        await ctx.reply('Enter username:')
    },ctx)
})

