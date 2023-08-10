const {bot}=require('../bot.config');
const {commandValidation,getMultiRequest}=require('../utils/utils')




bot.action('show_multi',async (ctx)=>{
    await commandValidation(async ()=>{
        const getMultiServers=await getMultiRequest(ctx);
        if(getMultiServers && getMultiServers.length>0){
            const list=getMultiServers.map(item=>{
                return `💻 آی پی آدرس: ${item.host}\n📡 پورت:${item.port}\n❔ وضعیت: ${item.status==='enable' ? 'فعال' : 'غیرفعال'}`
            }).join('\n<----------------------->\n');
            ctx.reply('✅ لیست سرور های مولتی به شرح زیر است: \n'+list,{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            })
        }else if(getMultiServers.length===-0){
            ctx.reply('❌ اطلاعات یافت نشد.',{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            })
        }else {
            ctx.reply('❌ اعدم امکان برقراری ارتباط با سرور.',{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            })
        }


    },ctx)
})

