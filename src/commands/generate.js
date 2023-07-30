const {bot}=require('../bot.config');
const {commandValidation,getUsersList,serverData,generateCommands}=require('../utils/utils')
const {userGenerateState}=require('../utils/generateUser')




bot.command('generate',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const generateUserData=userGenerateState(chatId);
        generateUserData.waitingForExdate=true
        generateUserData.waitingForCount=true
        await bot.telegram.sendMessage(chatId,'Enter Multi user:')
    },chatId,userId)

})

