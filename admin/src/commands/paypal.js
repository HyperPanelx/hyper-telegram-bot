const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {addPaypalData}=require('../utils/addPaypal')
const adminModel=require('../models/Admin')

bot.command('add_paypal',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:userId});
        if(userData.paypal_link.length>0){
            await bot.telegram.sendMessage(chatId,`✅ You have one available link:\n${userData.paypal_link}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'change link', callback_data: 'change_paypal_link',  }],
                    ],
                },
            });
        }else{
            addPaypalData.state=true
            await bot.telegram.sendMessage(chatId,'Enter link:');
        }
    },chatId,userId)
})