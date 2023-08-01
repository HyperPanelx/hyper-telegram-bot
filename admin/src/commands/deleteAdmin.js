const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {oneQuestion}=require('../utils/states')



bot.command('delete_admin',async (ctx)=>{
    await commandValidation(async ()=>{
        oneQuestion.key='delete_admin'
        oneQuestion.first=true
        await ctx.reply('Enter username:')
    },ctx)
})