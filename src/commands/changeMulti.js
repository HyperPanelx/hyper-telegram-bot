const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {userCreateAdminState} = require("../utils/createAdmin");
const {changeMultiState} = require("../utils/changeMulti");




bot.command('change_multi',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const changeMultiData=changeMultiState(chatId);
        changeMultiData.waitingForNewMulti=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)

})