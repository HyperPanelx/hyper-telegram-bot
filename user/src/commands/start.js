require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const transactionModel=require('../models/Transaction')
const userModel=require('../models/User');
const {addPhoneProcess}=require('../utils/addPhone')
const {getOneQuestionState,getTwoQuestionState}=require('../utils/states')
const {generateCommands,getAdminsServersList,getPlans,getZarinToken,getOrderData,transformPlanId,extractPlan}=require('../utils/utils');
const {SelectPlanProcess,selectServersProcess}=require('../utils/buyAccount')
const {shareData}=require('../utils/shareData')
///////////


bot.command('start', async ctx => {
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    ///failed
    /// A00000
    const getInitialMessage=ctx.update.message.text.split('/start')[1].trim();
    if(getInitialMessage.includes('failed')){
        const authority=getInitialMessage.split('failed')[1];
        const getTransaction=await transactionModel.findOne({transaction_id:authority,payment_status:'failed'});
        const data=extractPlan(getTransaction);
        await ctx.reply('❌ Transaction failed!\n'+`👜 Order id: ${data?._doc.order_id}\n🏆 Plan: ${data.plan.duration} Month - ${data.plan.multi} Multi user\n💴 Pay amount: ${data.plan.price} T\n🎖 Ref id : ${data?._doc.ref_id || ''}\n❔ Payment status: ${data?._doc?.payment_status}\n💳 Card number: ${data?._doc?.card_num || ''}`+'\n select show transactions and contact admins.')
    }else if(getInitialMessage.startsWith('A0')){
        const getTransaction=await transactionModel.findOne({transaction_id:getInitialMessage,payment_status:'success'});
        if(getTransaction){
            const data=extractPlan(getTransaction);
            await ctx.reply('✅ Transaction was successful!\n'+`👜 Order id: ${data?._doc.order_id}\n🏆 Plan: ${data.plan.duration} Month - ${data.plan.multi} Multi user\n💴 Pay amount: ${data.plan.price} T\n🎖 Ref id : ${data?._doc.ref_id || ''}\n❔ Payment status: ${data?._doc?.payment_status}\n💳 Card number: ${data?._doc?.card_num || ''}`+'\n select show accounts to get your account!')
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
    ////
    const getUserTransaction=await transactionModel.findOne({bot_id:ctx.from.id,payment_status:'waiting payment'});
    if(getUserTransaction){
        const order_data=getOrderData(getUserTransaction.plan_id,getUserTransaction.target_server);

        ctx.reply(`🗿 You have got one active order!\n🚨 order id: ${getUserTransaction.order_id}\n🚨 plan: ${order_data.plan.duration} month - ${order_data.plan.multi} multi user - ${order_data.plan.price} T\n🚨 waiting for payment.`,{
            reply_markup:{
                inline_keyboard:[
                    [{text:`pay`,url:process.env.REDIRECT_URL+`?authority=${getUserTransaction.transaction_id}&server=${process.env.SERVER_IP}&port=${process.env.PORT}&bot_name=${ctx.botInfo.username}&order_id=${getUserTransaction.order_id}`}],

                    [{text:'cancel order',callback_data:`cancel_order-${getUserTransaction.transaction_id}`}]
                ]
            }
        })
    }else{
        const twoQuestionState=getTwoQuestionState(ctx.chat.id);
        twoQuestionState.key='buy_account'
        twoQuestionState.first=true
        twoQuestionState.second=true
        await getPlans(ctx)
    }
})
bot.action('show_account',(ctx)=>{

})

bot.action('show_transactions',async (ctx)=>{
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

})






bot.on('callback_query', async (ctx) => {
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

})



bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    oneQuestionState.key==='add_phone' && await addPhoneProcess(ctx,txt)
});






