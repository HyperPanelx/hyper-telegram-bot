const {bot}=require('../bot.config');
const {commandValidation} = require("../utils/utils");
const {twoQuestion}=require('../utils/states')




bot.command('reset',async (ctx)=>{
    await commandValidation(async ()=>{
        twoQuestion.key='reset_password'
        twoQuestion.second=true
        await ctx.reply('Enter username:')
    },ctx)
})