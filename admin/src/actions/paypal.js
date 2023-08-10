const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const adminModel=require('../models/Admin')
const { getOneQuestionState}=require('../utils/states')


bot.action('add_paypal',async (ctx)=>{
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:ctx.from.id});
        if(userData.zarinpal_token && userData.zarinpal_token.length>0){
            //// has token
            await ctx.reply(`✅ شما یک توکن ثبت شده زرین پال دارید:\n${userData.zarinpal_token}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'تغییر توکن', callback_data: 'change_zarinpal_token',  }],
                        [{ text: 'حذف توکن', callback_data: 'remove_zarinpal_token',  }],
                    ],
                },
            });
        }else{
            /// no token
            /// select all admin
            const allAdmins=await adminModel.find({});
            const isTokenAvailable=allAdmins.some(item=>{
                if(item.zarinpal_token && item.zarinpal_token.length>0){
                    return item.zarinpal_token.length>0
                }
            })
            if(isTokenAvailable){
                await ctx.reply('❌ یک توکن زرین پال توسط یک ادمین دیگر ثبت شده است.',{
                    reply_markup: {
                        inline_keyboard: [
                            [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                        ]
                    }
                });
            }else{
                const oneQuestionState=getOneQuestionState(ctx.chat.id);
                oneQuestionState.key='add_paypal'
                oneQuestionState.first=true
                await ctx.reply('توکن را وارد نمایید:');
            }
        }
    },ctx)
})