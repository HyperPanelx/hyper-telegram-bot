const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getTwoQuestionState}=require('../utils/states')
const adminModel=require('../models/Admin')


bot.action('add_card_info',async (ctx)=>{
    await commandValidation(async ()=>{
        const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
        if(getAdmin.card_info && getAdmin.card_info.number.length>0 && getAdmin.card_info.name.length>0){
            //// has card
            await ctx.reply('\n✅ شما یک کارت بانکی ثبت شده دارید:\n'+`شماره حساب: ${getAdmin.card_info.number}\n نام دارنده حساب: ${getAdmin.card_info.name}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'حذف حساب', callback_data: 'remove_bank_card',  }],
                    ],
                },
            });

        }else{
            const getAdminWithCardInfo=await adminModel.$where('this.card_info && this.card_info.number.length>0 && this.card_info.name.length>0');

            if(getAdminWithCardInfo.length>0){
                await ctx.reply('❌ یک کارت بانکی توسط یک ادمین دیگر ثبت شده است.',{
                    reply_markup: {
                        inline_keyboard: [
                            [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                        ]
                    }
                });
            }else{
                const twoQuestionState=getTwoQuestionState(ctx.chat.id);
                twoQuestionState.key='add_card_info'
                twoQuestionState.second=true
                await ctx.reply('شماره حساب بانکی خود را وارد نمایید:')
            }
        }
    },ctx)
})


bot.action('remove_bank_card',async ctx=>{
    await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{card_info:{number:'',name:''}})
    await ctx.reply('✅ حساب بانکی شما با موفقیت حذف شد.',{
        reply_markup: {
            inline_keyboard: [
                [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
            ]
        }
    })
})

