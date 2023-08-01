const {bot}=require('../bot.config');
const {commandValidation,getUsersList,generateCommands}=require('../utils/utils')
const {serverData}=require('../utils/addServer')


bot.command('users',async (ctx)=>{
   await commandValidation(async ()=>{
       const usersList=await getUsersList(serverData.ip,serverData.token);
       if(usersList){
           await ctx.reply(`✅ users list:\n\n`+usersList)
           await generateCommands(ctx)
       }else{
           await ctx.reply(`❌ error in connecting to api!`)
       }
   },ctx)
})