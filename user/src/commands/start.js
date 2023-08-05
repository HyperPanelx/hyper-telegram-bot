require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const transactionModel=require('../models/Transaction')
const userModel=require('../models/User');
const {addPhoneProcess}=require('../utils/addPhone')
const {getOneQuestionState,getTwoQuestionState, resetAllStates}=require('../utils/states')
const {generateCommands,getAdminsServersList,getPlans,getZarinToken,getOrderData,transformPlanId,extractPlan,showTransactionResult,createPayLink,createOrder,queryValidation}=require('../utils/utils');
const {SelectPlanProcess,selectServersProcess}=require('../utils/buyAccount')
const {shareData}=require('../utils/shareData')
const {resetAllAnswers} = require("../utils/answers");
///////////


bot.command('start', async ctx => {
    resetAllAnswers(ctx.from.id);
    resetAllStates(ctx.from.id);
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    ///failed
    /// A00000
    const getInitialMessage=ctx.update.message.text.split('/start')[1].trim();
    if(getInitialMessage.includes('failed')){
       ctx.reply('❌ Something wrong happened in Zarin Pal! try again.')
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
            ctx.reply( `🫡 Hello ${first_name}, Welcome back to Hyper vpn provider. First of all we need your phone number in case that any error occurs:`);
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
        ctx.reply( `🫡 Hello ${first_name}, Welcome to Hyper vpn provider. First of all we need your phone number in case that any error occurs:`);

    }
})


bot.action('buy_account',async (ctx)=>{
    await queryValidation(async ()=>{
        const getUserTransaction=await transactionModel.findOne({bot_id:ctx.from.id,payment_status:'waiting payment'});
        if(getUserTransaction){
            const order_data=getOrderData(getUserTransaction.plan_id,getUserTransaction.target_server);
            await createOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,getUserTransaction.order_id,getUserTransaction.transaction_id,true);
        }else{
            const twoQuestionState=getTwoQuestionState(ctx.chat.id);
            twoQuestionState.key='buy_account'
            twoQuestionState.first=true
            twoQuestionState.second=true
            await getPlans(ctx)
        }
    },ctx)
})
bot.action('show_account',async (ctx)=>{
    await queryValidation(async ()=>{
        const userData=await userModel.findOne({bot_id:ctx.from.id});
        if(userData.accounts.length>0){
            const accounts=userData.accounts.map(item=>{
                return `👨🏼‍💼 Username: ${item.username}\n🗝 Password: ${item.password}\n📅 Active until: ${item.exdate}`
            })
            ctx.reply('✅ Your accounts list:\n\n'+accounts)
        }else{
            ctx.reply('❌ You dont have any account!')
        }
        await generateCommands(ctx)
    },null)
})

bot.action('show_transactions',async (ctx)=>{
    await queryValidation(async ()=>{
        const allTransactions=await transactionModel.find({bot_id:ctx.from.id});
        if(allTransactions.length>0){
            const data=transformPlanId(allTransactions)
            const transfered_data=data.map(item=>{
                return `👜 Order id: ${item._doc.order_id}\n🏆 Plan: ${item.plan_id.duration} Month - ${item.plan_id.multi} Multi user\n💴 Pay amount: ${item.plan_id.price} T\n🎖 Ref id : ${item._doc?.ref_id || ''}\n❔ Payment status: ${item._doc.payment_status}\n💳 Card number: ${item?._doc?.card_num || ''}`
            }).join('\n<--------------------->\n');
            await ctx.reply('✅ Your Transactions:\n'+transfered_data);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ You have zero transaction record.');
            await generateCommands(ctx);
        }
    },null)
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
            await ctx.reply('✅ Order cancelled!')
            await generateCommands(ctx)
        }

    },ctx)


})



bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    oneQuestionState.key==='add_phone' && await addPhoneProcess(ctx,txt)
});






