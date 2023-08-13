const {bot} = require("../bot.config");
const {queryValidation, getOrderData, getPlans,createPaypalOrder,createCardToCardOrder} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const { getThreeQuestionState} = require("../utils/states");
const {SelectPlanProcess, selectServersProcess,selectPaymentMethod} = require("../utils/buyAccount");
const {getThreeAnswersState} = require("../utils/answers");

bot.action('buy_account',async (ctx)=>{
    await queryValidation(async ()=>{
        const getUserTransaction=await transactionModel.findOne({bot_id:ctx.from.id,payment_status:'waiting payment'});
        if(getUserTransaction && getUserTransaction.payment_mode==='paypal'){
            const order_data=getOrderData(getUserTransaction.plan_id,getUserTransaction.target_server,1);
            await createPaypalOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,getUserTransaction.order_id,getUserTransaction.transaction_id,true);


        }else if(getUserTransaction && getUserTransaction.payment_mode==='card_to_card' ){
            const order_data=getOrderData(getUserTransaction.plan_id,getUserTransaction.target_server,2);
            await createCardToCardOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,getUserTransaction.order_id,true);

        } else{
            const threeQuestionState=getThreeQuestionState(ctx.chat.id);
            threeQuestionState.key='buy_account'
            threeQuestionState.first=true
            threeQuestionState.second=true
            threeQuestionState.third=true
            await getPlans(ctx)
        }
    },ctx,true,true)
})


bot.action(/^select_plan/,async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const plan_id=ctx.match['input'].split('-')[1]
        if(threeQuestionState.key==='buy_account' &&  threeQuestionState.first) {
            await SelectPlanProcess(ctx,plan_id);
        }
    },ctx,false,true)

})

bot.action(/^select_server/,async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const ip=ctx.match['input'].split('-')[1]
        if(threeQuestionState.key==='buy_account' &&   threeQuestionState.second) {
            await selectServersProcess(ctx,ip);
        }
    },ctx,false,true)

})


bot.action(/^select_method/,async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const id=Number(ctx.match['input'].split('-')[1]);
        if(threeQuestionState.key==='buy_account' &&   threeQuestionState.third) {
            await selectPaymentMethod(ctx,id)
        }
    },ctx,false,false)
})


bot.action(/^send_card/,async ctx=>{
    await queryValidation(async ()=>{
        const transaction_id=ctx.match['input'].split(':')[1];
        const getTransactionData=await transactionModel.findOne({order_id:transaction_id})
        if(getTransactionData.card_num.length>0 && getTransactionData.card_name.length>0){
            await ctx.reply('🚫 اطلاعات پرداخت این تراکنش قبلا ثبت شده است. لطفا کمی صبور باشید.')
        }else{
            const threeQuestionState=getThreeQuestionState(ctx.chat.id);
            const threeAnswersState=getThreeAnswersState(ctx.chat.id);
            threeQuestionState.key='send_card'
            threeQuestionState.second=true
            threeQuestionState.third=true
            threeAnswersState.first=transaction_id;
            await ctx.reply('لطفا شماره کارت پرداخت کننده را وارد نمایید:')
        }
    },ctx,true,false)
})