const {bot} = require("../bot.config");
const {queryValidation, getOrderData, createOrder, getPlans} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const {getTwoQuestionState} = require("../utils/states");

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
    },ctx,true,true)
})