const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {oneQuestion}=require('../utils/states')


bot.command('lock',async (ctx)=>{
    await commandValidation(async ()=>{
        oneQuestion.key='lock'
        oneQuestion.first=true
        await ctx.reply('Enter username:')
    },ctx)
})