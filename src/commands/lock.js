const {bot} = require("../bot.config");
const {commandValidation} = require("../utils/utils");
const {lockUserData}=require('../utils/lockUser')

bot.command('lock',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        lockUserData.state=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)
})