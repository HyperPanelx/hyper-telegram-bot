const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils');
const adminModel=require('../models/Admin')




bot.action('get_referral',async (ctx)=>{
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:ctx.from.id})
        await ctx.reply(`توکن معرفی شما:\n${userData.referral_token}`,{
            reply_markup: {
                inline_keyboard: [
                    [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                ]
            }
        })
    },ctx)

})