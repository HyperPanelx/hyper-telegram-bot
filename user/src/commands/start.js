require('dotenv').config()
const {bot}=require('../bot.config')
const transactionModel=require('../models/Transaction')
const userModel=require('../models/User');
const { resetAllStates, getThreeQuestionState, getTwoQuestionState}=require('../utils/states')
const {generateCommands,getAdminsServersList,getZarinToken,queryValidation,getPlanFromDB,problems,sendTransactionStatus,generateUser,getCardInfo}=require('../utils/utils');
const {shareData}=require('../utils/shareData')
const {resetAllAnswers, getThreeAnswersState} = require("../utils/answers");
const {sendTicketProcess} = require("../utils/sendTicket");
const {sendCardProcess} = require("../utils/sendCard");
///////////


bot.command('start', async ctx => {
    resetAllAnswers(ctx.from.id);
    resetAllStates(ctx.from.id);
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    shareData.plans=await getPlanFromDB();
    shareData.card_info=await getCardInfo()


    //////////
    const {id,username}=ctx.from;
    const userData=await userModel.findOne({bot_id:id});
    if(!userData){
        const newUser=new userModel({
            tel_username:username.length>0 ? username  : 'unknown',
            bot_id:id,
            accounts:[]
        });
        await newUser.save();
    }
    await generateCommands(ctx);
});


bot.action(/^ticket_title/g,async (ctx)=>{
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    if(threeQuestionState.key==='send_ticket' && threeQuestionState.second){
        const id=Number(ctx.match['input'].split('-')[1]);
        threeQuestionState.second=false
        ///// title id
        threeAnswersState.first=id;
        if(id===1){
            await ctx.reply('نام کاربری اکانت را وارد نمایید:')
        }else if(id===2){
            await ctx.reply('شماره سفارش را وارد نمایید:')
        }
    }

})



bot.action(/^cancel_order/,async ctx=>{
    await queryValidation(async ()=>{
        const date=new Date();
        const transaction_id=ctx.match['input'].split(':')[1];
        await transactionModel.findOneAndUpdate({transaction_id:transaction_id},{payment_status:'failed',updated_at:date.toLocaleString()});
        await ctx.reply('✅ سفارش شما با موفقیت کنسل شد!')
        await generateCommands(ctx)
    },ctx,true,false)
})

bot.action(/^check_transaction/,async ctx=>{
    await queryValidation(async ()=>{
        const order_id=ctx.match['input'].split(':')[1];
        const transactionData=await transactionModel.findOne({order_id,payment_status:'waiting payment',payment_mode:'card_to_card'});

        if(transactionData && transactionData.submit_stage===1){
            //// ok
            //// send transaction data to telegram chat
            await sendTransactionStatus(transactionData,'','',true)
            //// create user
            await generateUser(transactionData);
            //// update transaction
            transactionData.payment_status='success'
            await transactionData.save()


        }else if(transactionData && transactionData.submit_stage===2){
            /// nok
            //// send transaction data to telegram chat
            await sendTransactionStatus(transactionData,'','',false)
            //// update transaction
            transactionData.payment_status='failed'
            await transactionData.save()
        }else{
            ctx.reply('⏰ تراکنش در دست بررسی می باشد. لطفا کمی صبور باشید.');
        }
    },ctx,true,false)
})


bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    threeQuestionState.key==='send_ticket' && await sendTicketProcess(ctx,txt);
    threeQuestionState.key==='send_card' && await sendCardProcess(ctx,txt);
});






