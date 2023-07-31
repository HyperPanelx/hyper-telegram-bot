const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {unlockUserData}=require('../utils/unlockUser')

bot.command('unlock',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        unlockUserData.state=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)
})