const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {userGenerateState}=require('../utils/generateUser')
const {userCreateAdminState}=require('../utils/createAdmin')



bot.command('create',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const createAdminData=userCreateAdminState(chatId);
        createAdminData.waitingForPass=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)

})