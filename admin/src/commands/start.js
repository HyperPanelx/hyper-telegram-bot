require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
////
const {resetAllStates,getThreeQuestionState,getFourQuestionState,getTwoQuestionState,getOneQuestionState,
    getFiveQuestionState
}=require('../utils/states');
const {resetAllAnswers,getThreeAnswersState}=require('../utils/answers')
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
const {addMultiServerProcess}=require('../utils/addMulti')
///////////

bot.command('start', async ctx => {
    resetAllStates(ctx.chat.id);
    resetAllAnswers(ctx.chat.id);
    await ctx.reply('لطفا چند لحظه صبر کنید...')
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
                multi:[]
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
            if(response.server && response.server.ip && response.server.token && response.server.ssh_port){
                const {ip,ssh_port}=response.server;
                ctx.reply(
                    `✅ سلام دوست عزیز, شما یک سرور فعال دارید. جهت ادامه کار آنرا انتخاب کنید.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{text:ip+` - ssh port: ${ssh_port}`,callback_data: `select_server`}],
                            ],
                        }
                    })
            }else{
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
            }

        }
    })

})




bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    const fiveQuestionState=getFiveQuestionState(ctx.chat.id);
    fiveQuestionState.key==='add_server' &&  await addServerProcess(ctx,txt);
    fourQuestionState.key==='add_multi' &&  await addMultiServerProcess(ctx,txt);
    fourQuestionState.key==='generate' && await generateUserProcess(ctx,txt);
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




