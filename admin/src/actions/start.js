const {bot} = require("../bot.config");
const {generateMenu, getMe, getMultiRequest, removeDuplicate,filterMultiServers} = require("../utils/utils");
const {getFiveQuestionState, getOneQuestionState, getThreeQuestionState} = require("../utils/states");
const adminModel = require("../models/Admin");
const {getThreeAnswersState} = require("../utils/answers");
const {resetServerData, getServerData} = require("../utils/addServer");


bot.action('select_server',async (ctx)=>{
    await ctx.reply('در حال دریافت اطلاعات سرور.لطفا چند لحظه صبر کنید...')
    const adminData=await adminModel.findOne({bot_id:ctx.from.id});
    const {ip,token}=adminData.server;
    const isTokenValid=await getMe(ip,token);
    if(isTokenValid){
        const serverDataState=getServerData(ctx.chat.id)
        serverDataState.ip=ip;
        serverDataState.token=token;
        //// get server multi
        const serverMulti=await getMultiRequest(ctx)
        if(serverMulti && serverMulti.length>0){
            adminData.multi=filterMultiServers(serverMulti)
            await adminData.save()
        }
        await generateMenu(ctx)
    }else {
        await ctx.reply(`❌ توکن صادر شده توسط سرور منقضی شده است. شما احتیاج به احرازهویت مجدد برای استفاده از منابع این سرور دارید.`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'شروع احرازهویت', callback_data: `start_authentication`}],
                ],
            }
        });
    }
})


bot.action('add_server',async (ctx)=>{
    const fiveQuestionState=getFiveQuestionState(ctx.chat.id);
    fiveQuestionState.key='add_server'
    fiveQuestionState.second=true
    fiveQuestionState.third=true
    fiveQuestionState.fourth=true
    fiveQuestionState.fifth=true
    await ctx.reply('آی پی آدرس سرور را وارد نمایید:')
})

bot.action('cancel_add_server',async (ctx)=>{
    await ctx.reply('😪 شاید بعدا!')
})



bot.action('change_zarinpal_token',async (ctx)=>{
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    oneQuestionState.key='add_paypal';
    oneQuestionState.first=true;
    await ctx.reply('توکن معتبر زرین پال را وارد نمایید:\n⚠️ اخطار: در صورت اشتباه بودن توکن, کاربران جهت خرید اکانت در ربات کاربران به مشکل بر خواهند خورد.\n⚠️ اخطار: هر سرور فقط اجازه ثبت یک توکن را دارد.');
})

bot.action('remove_zarinpal_token',async (ctx)=>{
    await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{zarinpal_token:''});
    await ctx.reply('✅ توکن با موفقیت حذف شد.',{
        reply_markup: {
            inline_keyboard: [
                [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
            ]
        }
    });
})



bot.action('start_authentication',async ctx=>{
    const getAdminData=await adminModel.findOne({bot_id:ctx.from.id});
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    threeQuestionState.key='start_authentication';
    threeQuestionState.third=true;
    threeAnswersState.first=getAdminData.server.ip;
    ctx.reply('نام کاربری ادمین را وارد نمایید:')
})

bot.action('remove_server',async ctx=>{
    await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{server:{},multi:[]});
    resetServerData(ctx.chat.id)
    ctx.reply('✅ سرور با موفقیت حذف شد! کامند start/ را جهت ادامه کار وارد نمایید. ')
})