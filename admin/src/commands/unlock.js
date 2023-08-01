const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {oneQuestion}=require('../utils/states')


bot.command('unlock',async (ctx)=>{
    await commandValidation(async ()=>{
        oneQuestion.key='unlock'
        oneQuestion.first=true
        await ctx.reply('Enter username:')
    },ctx)
})