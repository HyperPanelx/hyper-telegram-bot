const {bot} = require("../bot.config");
const {queryValidation, getOrderData, getPlans,createPaypalOrder,createCardToCardOrder} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const {getTwoQuestionState, getThreeQuestionState} = require("../utils/states");
const {SelectPlanProcess, selectServersProcess,selectPaymentMethod} = require("../utils/buyAccount");

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
    })

})

bot.action(/^select_server/,async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const ip=ctx.match['input'].split('-')[1]
        if(threeQuestionState.key==='buy_account' &&   threeQuestionState.second) {
            await selectServersProcess(ctx,ip);
        }
    })

})


bot.action(/^select_method/,async (ctx)=>{
    await queryValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const id=Number(ctx.match['input'].split('-')[1]);
        if(threeQuestionState.key==='buy_account' &&   threeQuestionState.third) {
            await selectPaymentMethod(ctx,id)
        }
    })
})