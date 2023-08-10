const {bot}=require('../bot.config');
const {commandValidation,getOnlineUsersList}=require('../utils/utils')


bot.action('online_list',async (ctx)=>{
    await commandValidation(async ()=>{
        const onlineUsersList=await getOnlineUsersList(ctx);
        if(onlineUsersList){
            await ctx.reply('✅ لیست کاربران آنلاین به شرح زیر است:\n\n'+onlineUsersList,{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            })
        }else{
            await ctx.reply(`❌ عدم امکان برقراری ارتباط با سرور`)
        }
    },ctx)
})