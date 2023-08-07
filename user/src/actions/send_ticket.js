const {bot} = require("../bot.config");
const {queryValidation,problems} = require("../utils/utils")
const {getThreeQuestionState}=require('../utils/states')



bot.action('send_ticket',async (ctx)=>{
    await queryValidation(async ()=>{
        const ticketTitle=problems.map(item=>{
            return [{text:item.title,callback_data:`ticket_title-${item.id}`}]
        });
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        threeQuestionState.key='send_ticket'
        threeQuestionState.second=true
        threeQuestionState.third=true
        await ctx.reply('مشکل شما در مورد کدام یک از موارد زیر است:',{
            reply_markup:{
                inline_keyboard:[
                    ...ticketTitle
                ]
            }
        });
    },ctx,true,false)
})