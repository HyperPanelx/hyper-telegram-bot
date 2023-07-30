const {bot}=require('../bot.config');
const {commandValidation,getUsersList,generateCommands}=require('../utils/utils')
const {serverData}=require('../utils/addServer')


bot.command('users',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
   await commandValidation(async ()=>{
        const usersList=await getUsersList(serverData.ip,serverData.token,chatId);
        await bot.telegram.sendMessage(chatId,`👨🏼‍💼 users list:\n`+usersList)
        await generateCommands(chatId,userId)
   },chatId,userId)
})