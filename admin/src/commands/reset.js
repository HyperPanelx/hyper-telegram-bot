const {bot}=require('../bot.config');
const {commandValidation} = require("../utils/utils");
const {resetUserPassProcess,userResetPassState} = require("../utils/resetPass");
const {userGenerateState} = require("../utils/generateUser");




bot.command('reset',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const resetPassUserData=userResetPassState(chatId);
        resetPassUserData.waitingForNewPass=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)


})