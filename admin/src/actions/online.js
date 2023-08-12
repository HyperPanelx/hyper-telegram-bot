const {bot}=require('../bot.config');
const {commandValidation,getOnlineUsersList,showMultiServerToPick}=require('../utils/utils')


bot.action('online_list',async (ctx)=>{
    await commandValidation(async ()=>{
        await showMultiServerToPick(ctx,'online_multi_select')
    },ctx)
})

bot.action(/online_multi_select/g,async (ctx)=>{
    const ip=ctx.match['input'].split('-')[1];
    const onlineUsersList=await getOnlineUsersList(ctx,ip);
    if(onlineUsersList){
        await ctx.reply('✅ لیست کاربران آنلاین به شرح زیر است:\n\n'+onlineUsersList,{
            reply_markup: {
                inline_keyboard: [
                    [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                ]
            }
        })
    }else{
        await ctx.reply(`❌ کاربر آنلاینی یافت نشد!`,{
            reply_markup: {
                inline_keyboard: [
                    [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                ]
            }
        })
    }


})