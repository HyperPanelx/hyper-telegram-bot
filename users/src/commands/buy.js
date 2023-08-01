const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {buy_plans}=require('../utils/utils')

function data(){
    console.log('dede')
}

bot.command('buy',async (ctx)=>{
    const userId=ctx.from.id
    const chatId=ctx.chat.id
    await commandValidation(()=>{
        const plans=buy_plans.map(item=>{
            return [{text:`${item.plan} - ${item.price} Toman`,callback_data:'select_plan'}]
        });
        bot.telegram.sendMessage(chatId,`✅ Our available plans are:`,{
            reply_markup:{
                inline_keyboard:[
                    ...plans
                ]
            }
        });


    },chatId,userId)
})

bot.action('select_plan',(ctx)=>{
    console.log(ctx.match['index'])
})