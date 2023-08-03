const {bot}=require('../bot.config');
const {commandValidation,getOnlineUsersList,generateCommands}=require('../utils/utils')


bot.command('online',async (ctx)=>{
    await commandValidation(async ()=>{
        const onlineUsersList=await getOnlineUsersList(ctx);
        if(onlineUsersList){
            await ctx.reply('✅ online users:\n\n'+onlineUsersList)
            await generateCommands(ctx);
        }else{
            await ctx.reply(`❌ error in connecting to api!`)
        }
    },ctx)
})