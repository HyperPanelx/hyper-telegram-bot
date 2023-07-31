const {bot}=require('../bot.config');
const {commandValidation,generateCommands}=require('../utils/utils');
const adminModel=require('../models/Admin')




bot.command('referral_token',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:userId})
        await bot.telegram.sendMessage(chatId,`your referral token is:\n${userData.referral_token}`)
        await generateCommands(chatId,userId)
    },chatId,userId)

})