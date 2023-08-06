const {bot}=require('../bot.config');
const {commandValidation,getUsersList,generateCommands}=require('../utils/utils')


bot.command('users',async (ctx)=>{
   await commandValidation(async ()=>{
       const usersList=await getUsersList(ctx);
       if(usersList){
           await ctx.reply(`✅ لیست کاربران به شرح زیر است:\n\n`+usersList)
           await generateCommands(ctx)
       }else{
           await ctx.reply(`❌ error in connecting to api!`)
       }
   },ctx)
})