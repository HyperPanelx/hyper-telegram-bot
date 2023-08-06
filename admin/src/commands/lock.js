const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const { getOneQuestionState}=require('../utils/states')


bot.command('lock',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='lock'
        oneQuestionState.first=true
        await ctx.reply('نام کاربری را وارد نمایید:')
    },ctx)
})