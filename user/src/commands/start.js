require('dotenv').config()
const {bot}=require('../bot.config')
const transactionModel=require('../models/Transaction')
const userModel=require('../models/User');
const {addPhoneProcess}=require('../utils/addPhone')
const {getOneQuestionState,getTwoQuestionState, resetAllStates, getThreeQuestionState}=require('../utils/states')
const {generateCommands,getAdminsServersList,getZarinToken,extractPlan,showTransactionResult,queryValidation,getPlanFromDB}=require('../utils/utils');
const {SelectPlanProcess,selectServersProcess}=require('../utils/buyAccount')
const {shareData}=require('../utils/shareData')
const {resetAllAnswers} = require("../utils/answers");
const {sendTicketProcess} = require("../utils/sendTicket");
///////////


bot.command('start', async ctx => {
    resetAllAnswers(ctx.from.id);
    resetAllStates(ctx.from.id);
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    shareData.plans=await getPlanFromDB();
    ///failed
    /// A00000
    const getInitialMessage=ctx.update.message.text.split('/start')[1].trim();
    if(getInitialMessage.includes('failed')){
       ctx.reply('❌ یک مشکلی از طرف زرین پال بوجود آمد!')
    }else if(getInitialMessage.startsWith('A0')){
        const getTransaction=await transactionModel.findOne({transaction_id:getInitialMessage});
        if(getTransaction){
            const data=extractPlan(getTransaction);
            await showTransactionResult(ctx,data);
        }
    }


    const {id,first_name,username}=ctx.from;
    const userData=await userModel.findOne({bot_id:id});
    if(userData){
        if(userData.phone.length>0){
            await generateCommands(ctx)
        }else{
            const oneQuestionState=getOneQuestionState(ctx.chat.id);
            oneQuestionState.key='add_phone'
            oneQuestionState.first=true
            ctx.reply(`🌎️ سلام دوست عزیز,\nبه ربات هایپر خوش بازگشتید. جهت خدمات بهتر ابتدا شماره موبایل خود را وارد نمایید:`);
        }
    }else{
        const newUser=new userModel({
            tel_name:first_name || 'unknown',
            tel_username:username || 'unknown',
            bot_id:id,
            phone:'',
            accounts:[]
        });
        await newUser.save();
        const oneQuestionState=getOneQuestionState(ctx.chat.id);
        oneQuestionState.key='add_phone'
        oneQuestionState.first=true
        ctx.reply( `🌎️ سلام دوست عزیز,\nبه ربات هایپر خوش آمدید. جهت خدمات بهتر ابتدا شماره موبایل خود را وارد نمایید:`);

    }
})



bot.on('callback_query', async (ctx) => {
    await queryValidation(async ()=>{
        const query=ctx.update.callback_query.data;
        const twoQuestionState=getTwoQuestionState(ctx.chat.id);
        if(twoQuestionState.key==='buy_account'){
            if(query.includes('select_plan') && twoQuestionState.first){
                await SelectPlanProcess(ctx,query);

            }else if(query.includes('select_server') && twoQuestionState.second){
                await selectServersProcess(ctx,query);

            }
        }

        if(query.includes('cancel_order')){
            const transaction_id=query.split('-')[1];
            await transactionModel.findOneAndUpdate({transaction_id:transaction_id},{payment_status:'failed'});
            await ctx.reply('✅ سفارش شما با موفقیت کنسل شد!')
            await generateCommands(ctx)
        }

    },ctx,false,true)


})



bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    oneQuestionState.key==='add_phone' && await addPhoneProcess(ctx,txt);
    threeQuestionState.key==='send_ticket' && await sendTicketProcess(ctx,txt);
});






