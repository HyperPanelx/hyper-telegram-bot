const {bot} = require("../bot.config");
const {queryValidation} = require("../utils/utils")
const {getThreeQuestionState}=require('../utils/states')




bot.action('send_ticket',async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        threeQuestionState.key='send_ticket'
        threeQuestionState.second=true
        threeQuestionState.third=true
        await ctx.reply('شماره سفارش مدنظر را وارد نمایید:')
    },ctx,true,false)
})