const {bot}=require('../bot.config');
const {commandValidation,getOnlineUsersList,generateCommands}=require('../utils/utils')


bot.command('online',async (ctx)=>{
    await commandValidation(async ()=>{
        const onlineUsersList=await getOnlineUsersList(ctx);
        if(onlineUsersList){
            await ctx.reply('✅ لیست کاربران آنلاین به شرح زیر است:\n\n'+onlineUsersList)
            await generateCommands(ctx);
        }else{
            await ctx.reply(`❌ عدم امکان برقراری ارتباط با سرور`)
        }
    },ctx)
})