const {bot}=require('../bot.config');
const {commandValidation,getUsersList,serverData,generateCommands}=require('../utils/utils')
const {userGenerateState}=require('../utils/generateUser')
let {deleteUserData}=require('../utils/deleteUser')


bot.command('delete',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        deleteUserData.state=true
        await bot.telegram.sendMessage(chatId,'Enter username:')
    },chatId,userId)
})

