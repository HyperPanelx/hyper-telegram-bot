const {bot}=require('../bot.config');
const {commandValidation,generateCommands}=require('../utils/utils');
const adminModel=require('../models/Admin')




bot.command('referral_token',async (ctx)=>{
    await commandValidation(async ()=>{
        const userData=await adminModel.findOne({bot_id:ctx.from.id})
        await ctx.reply(`توکن معرفی شما:\n${userData.referral_token}`)
        await generateCommands(ctx)
    },ctx)

})