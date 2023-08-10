const {bot}=require('../bot.config');
const {commandValidation,getUsersList}=require('../utils/utils')


bot.action('users_list',async (ctx)=>{
   await commandValidation(async ()=>{
       const usersList=await getUsersList(ctx);
       if(usersList){
           await ctx.reply(`✅ لیست کاربران به شرح زیر است:\n\n`+usersList,{
               reply_markup: {
                   inline_keyboard: [
                       [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                   ]
               }
           })
       }else{
           await ctx.reply(`❌ error in connecting to api!`)
       }
   },ctx)
})