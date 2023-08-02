const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const { getOneQuestionState}=require('../utils/states')


bot.command('unlock',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='unlock'
        oneQuestionState.first=true
        await ctx.reply('Enter username:')
    },ctx)
})