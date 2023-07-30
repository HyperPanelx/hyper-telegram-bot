const {bot}=require('../bot.config');
const {commandValidation,getOnlineUsersList,generateCommands}=require('../utils/utils')
const {serverData}=require('../utils/addServer')


bot.command('online',async (ctx)=>{
    const userId=ctx.from.id;
    const chatId=ctx.chat.id;
    await commandValidation(async ()=>{
        const onlineUsersList=await getOnlineUsersList(serverData.ip,serverData.token,chatId);
        await bot.telegram.sendMessage(chatId,'👨🏼‍💻 online users:\n'+onlineUsersList)
        await generateCommands(chatId,userId)
    },chatId,userId)
})