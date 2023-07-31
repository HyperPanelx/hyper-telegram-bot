const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {deleteUserData} = require("../utils/deleteAdminUser");




bot.command('delete_admin',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        deleteUserData.state=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)

})