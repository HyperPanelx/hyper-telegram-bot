const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')


bot.command('accounts',async (ctx)=>{
    const userId=ctx.from.id
    const chatId=ctx.chat.id
    await commandValidation(()=>{
        console.log('here')

    },chatId,userId)
})
