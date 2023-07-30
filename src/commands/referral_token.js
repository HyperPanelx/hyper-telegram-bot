const {bot}=require('../bot.config');
const {commandValidation,generateCommands}=require('../utils/utils');
const userModel=require('../models/User')




bot.command('referral_token',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const userData=await userModel.findOne({bot_id:userId})
        await bot.telegram.sendMessage(chatId,`your referral token is:\n${userData.referral_token}`)
        await generateCommands(chatId,userId)
    },chatId,userId)

})