const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {oneQuestion}=require('../utils/states')


bot.command('get_ip',async (ctx)=>{
    await commandValidation(async ()=>{
        oneQuestion.key='get_ip'
        oneQuestion.first=true
        await ctx.reply('Enter username:')
    },ctx)
})