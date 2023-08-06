const {bot} = require("../bot.config");
const {queryValidation, generateCommands} = require("../utils/utils");
const userModel = require("../models/User");


bot.action('show_account',async (ctx)=>{
    await queryValidation(async ()=>{
        const userData=await userModel.findOne({bot_id:ctx.from.id});
        if(userData.accounts.length>0){
            const accounts=userData.accounts.map(item=>{
                return `👨🏼‍💼 نام کاربری: ${item.username}\n🗝 رمز عبور: ${item.password}\n📱 کاربر همزمان: ${item.multi}\n📅 فعال تا تاریخ: ${item.exdate}`
            }).join('\n<---------------------------------------------->\n');
            await ctx.reply('✅لیست اکانت های شما به شرح زیر است:\n\n'+accounts)
        }else{
            await ctx.reply('❌ شما در حال حاضر هیچ اکانتی ندارید.')
        }
        await generateCommands(ctx)
    },ctx,true,false)
})
