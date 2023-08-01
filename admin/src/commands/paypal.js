const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const adminModel=require('../models/Admin')
const {oneQuestion}=require('../utils/states')


bot.command('add_paypal',async (ctx)=>{
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:ctx.from.id});
        if(userData.paypal_link.length>0){
            await ctx.reply(`✅ You have one available link:\n${userData.paypal_link}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'change link', callback_data: 'change_paypal_link',  }],
                    ],
                },
            });
        }else{
            oneQuestion.key='add_paypal'
            oneQuestion.first=true
            await ctx.reply('Enter link:');
        }
    },ctx)
})