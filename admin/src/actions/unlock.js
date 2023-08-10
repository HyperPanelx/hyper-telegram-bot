const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const { getOneQuestionState}=require('../utils/states')


bot.action('unlock_user',async (ctx)=>{
    await commandValidation(async ()=>{
        const oneQuestionState=getOneQuestionState(ctx.chat.id)
        oneQuestionState.key='unlock'
        oneQuestionState.first=true
        await ctx.reply('نام کاربری را وارد نمایید:')
    },ctx)
})