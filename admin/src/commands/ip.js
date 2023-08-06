const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const { getOneQuestionState}=require('../utils/states')


bot.command('get_ip',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='get_ip'
        oneQuestionState.first=true
        await ctx.reply('نام کاربری رت وارد نمایید:')
    },ctx)
})