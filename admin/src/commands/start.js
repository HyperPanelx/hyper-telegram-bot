require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
////
const {resetAllStates,getThreeQuestionState,getFourQuestionState,getTwoQuestionState,getOneQuestionState}=require('../utils/states');
const {resetAllAnswers,getThreeAnswersState}=require('../utils/answers')
const {generateCommands,getMe}=require('../utils/utils');
const {addServerProcess, resetServerData,getServerData}=require('../utils/addServer');
const {generateUserProcess}=require('../utils/generateUser');
const {deleteUserProcess}=require('../utils/deleteUser');
const {unlockUserProcess}=require('../utils/unlockUser');
const {lockUserProcess}=require('../utils/lockUser');
const {resetUserPassProcess}=require('../utils/resetPass');
const {createAdminProcess}=require('../utils/createAdmin');
const {deleteAdminUserProcess}=require('../utils/deleteAdminUser');
const {changeMultiProcess}=require('../utils/changeMulti');
const {addPaypalProcess}=require('../utils/addPaypal');
const {getIPProcess}=require('../utils/getIP');
const {startAuthProcess}=require('../utils/startAuth');
const {answerTicketProcess}=require('../utils/answerTicket');
const {getTransactionProcess}=require('../utils/getTransaction');
///////////

bot.command('start', ctx => {
    ctx.reply('در حال توسعه. کار نکنید.')
    resetAllStates(ctx.chat.id);
    resetAllAnswers(ctx.chat.id);
    const {id,first_name}=ctx.from;
    adminModel.
    findOne({bot_id:id}).
    then(async response=>{
        if(!response){
            //// first time
            const newUser=new adminModel({
                bot_id:id,
                firstname:first_name,
                referral_token:nanoid.nanoid(32),
                server:[],
                zarinpal_token:''
            });
            newUser.
            save().
            then(()=>{
                ctx.reply(
                    `✅ سلام دوست عزیز,\nبه ربات هایپر جهت کنترل کردن سرور های ssh که توسط هایپر نصب شده اند خوش آمدید. در ابتدا برای شروع کار ما نیاز به ثبت یک سرور فعال از طرف شما داریم.`,
                    {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'اضافه کردن سرور', callback_data: 'add_server'}],
                        ],
                    }
                })
            })
        }else{
            if(response.server.length===0){
               ctx.reply(
                   `✅ سلام دوست عزیز,\nخوش آمدید. آیا مایل به اضافه کردن یک سرور هستید؟`,
                   {
                   reply_markup: {
                       inline_keyboard: [
                           [{ text: '✅ بله', callback_data: 'add_server',  }],
                           [{ text: '❌ خیر', callback_data: 'cancel_add_server' }],
                       ],
                   },
               })
            }else{
                const servers_list=response.server.map((item)=>{
                    return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
                });
                ctx.reply(
                    `✅ سلا دوست عزیز, شما ${response.server.length} سرور فعال دارید. جهت ادامه کار یک سرور را انتخاب کنید.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                ...servers_list,
                                [{text:'اضافه کردن سرور',callback_data: 'add_server'}],
                            ],
                        }
                    })
            }

        }
    })

})



bot.action('add_server',async (ctx)=>{
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    fourQuestionState.key='add_server'
    fourQuestionState.second=true
    fourQuestionState.third=true
    fourQuestionState.fourth=true
    await ctx.reply('آی پی آدرس سرور را وارد نمایید:')
})

bot.action('cancel_add_server',async (ctx)=>{
    await ctx.reply('😪 شاید بعدا!')
})

bot.action('show_servers',async (ctx)=>{
    const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
    const servers_list=getAdmin.server.map((item)=>{
        return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
    });
    ctx.reply(
        `✅ سرور های ثبت شده توسط شما:`,
        {
            reply_markup: {
                inline_keyboard: [
                    ...servers_list,
                ],
            }
        })

})

bot.action('change_zarinpal_token',async (ctx)=>{
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    oneQuestionState.key='add_paypal'
    oneQuestionState.first=true
    await ctx.reply('توکن معتبر زرین پال را وارد نمایید:\n⚠️ اخطار: در صورت اشتباه بودن توکن, کاربران جهت خرید اکانت در ربات کاربران به مشکل بر خواهند خورد.\n⚠️ اخطار: هر سرور فقط اجازه ثبت یک توکن را دارد.');
})
bot.action('show_to_remove_server',async (ctx)=>{
    const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
    const servers_list=getAdmin.server.map((item)=>{
        return [{text:item.ip,callback_data: `remove_server-${item.ip}`}]
    });
    ctx.reply(
        `❔ سرور مد نظر را جهت حذف انتخاب کنید:`,
        {
            reply_markup: {
                inline_keyboard: [
                    ...servers_list,
                ],
            }
        })

})



bot.on('callback_query',async (ctx)=>{
    const query=ctx.update.callback_query.data;
    const getAdminData=await adminModel.findOne({bot_id:ctx.from.id});
    if(query.includes('select_server')){
        const server_ip=query.split('-')[1];
        const token=getAdminData.server.filter(item=>item.ip===server_ip)[0].token;
        const isTokenValid=await getMe(server_ip,token);
        if(isTokenValid){
            const serverDataState=getServerData(ctx.chat.id)
            serverDataState.ip=server_ip
            serverDataState.token=token
            await generateCommands(ctx);
        }else{
            await ctx.reply(`❌ توکن صادر شده توسط api منقضی شده است. شما احتیاج به احرازهویت مجدد برای استفاده از منابع این سرور دارید.`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text:'start authentication',callback_data: `start_authentication-${server_ip}`}],
                    ],
                }
            });
        }
    }else if(query.includes('start_authentication')){
        const server_ip=query.split('-')[1];
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const threeAnswersState=getThreeAnswersState(ctx.chat.id);
        threeQuestionState.key='start_authentication';
        threeQuestionState.third=true;
        threeAnswersState.first=server_ip;
        ctx.reply('نام کاربری ادمین را وارد نمایید:')
    }else if(query.includes('remove_server')){
        const server_ip=query.split('-')[1];
        const adminServers=[...getAdminData.server];
        const filterServers=adminServers.filter(item=>item.ip!==server_ip);
        await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{server:filterServers});
        resetServerData(ctx.chat.id)
        ctx.reply('✅ سرور با موفقیت حذف شد! کامند start/ را جهت ادامه کار وارد نمایید. ')
    }
})





bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    fourQuestionState.key==='add_server' &&  await addServerProcess(ctx,txt);
    threeQuestionState.key==='generate' && await generateUserProcess(ctx,txt);
    oneQuestionState.key==='delete_user' && await deleteUserProcess(ctx,txt);
    oneQuestionState.key==='get_transaction' && await getTransactionProcess(ctx,txt);
    twoQuestionState.key==='answer_ticket' && await answerTicketProcess(ctx,txt);
    oneQuestionState.key==='unlock' && await unlockUserProcess(ctx,txt);
    oneQuestionState.key==='lock' && await lockUserProcess(ctx,txt);
    twoQuestionState.key==='reset_password' && await resetUserPassProcess(ctx,txt);
    threeQuestionState.key==='create_admin' && await createAdminProcess(ctx,txt);
    oneQuestionState.key==='delete_admin' && await deleteAdminUserProcess(ctx,txt);
    twoQuestionState.key==='change_multi' && await changeMultiProcess(ctx,txt);
    oneQuestionState.key==='add_paypal' && await addPaypalProcess(ctx,txt);
    oneQuestionState.key==='get_ip' && await getIPProcess(ctx,txt);
    threeQuestionState.key==='start_authentication' && await startAuthProcess(ctx,txt);
});




