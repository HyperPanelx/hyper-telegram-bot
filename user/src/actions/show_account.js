const {bot} = require("../bot.config");
const {queryValidation, generateCommands} = require("../utils/utils");
const userModel = require("../models/User");


bot.action('show_account',async (ctx)=>{
    await queryValidation(async ()=>{
        const userData=await userModel.findOne({bot_id:ctx.from.id});
        if(userData.accounts.length>0){
            const accounts=userData.accounts.map(item=>{
                if(item.target_multi==='localhost'){
                    return `👨🏼‍💼 نام کاربری:\n ${item.username}\n🗝 رمز عبور:\n ${item.password}\n📱 کاربر همزمان: ${item.multi}\n💻آی پی آدرس: ${item.server.split(':')[0]}\n🌐پورت: ${item.ssh_port || 22}\n📅 فعال تا تاریخ: ${item.exdate}`
                }else{
                    return `👨🏼‍💼 نام کاربری:\n ${item.username}\n🗝 رمز عبور:\n ${item.password}\n📱 کاربر همزمان: ${item.multi}\n💻آی پی آدرس: ${item.target_multi.split(':')[0]}\n🌐پورت: ${item.target_multi.split(':')[1]}\n📅 فعال تا تاریخ: ${item.exdate}`
                }
            }).join('\n<---------------------------------------------->\n');
            await ctx.reply('✅لیست اکانت های شما به شرح زیر است:\n\n'+accounts+'\n\n👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻\n آموزش اتصال اکانت ها در اندروید و  آیو اس:'+'\n @hyper_vpn_installation')
        }else{
            await ctx.reply('❌ شما در حال حاضر هیچ اکانتی ندارید.')
        }
        await generateCommands(ctx)
    },ctx,true,false)
})
