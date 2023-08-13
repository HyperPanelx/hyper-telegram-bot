const {getThreeQuestionState, resetAllStates} = require("./states");
const {getThreeAnswersState, resetAllAnswers} = require("./answers");
const transactionModel=require('../models/Transaction')

const sendCardProcess = async (ctx,text) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    const date=new Date();
    if(threeQuestionState.second){
        threeQuestionState.second=false
        /// card number
        threeAnswersState.second=text
        await ctx.reply('لطفا نام فرد دارنده حساب را وارد نمایید:')
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        /// card name
        threeAnswersState.third=text
        ///
        await transactionModel.findOneAndUpdate(
            {order_id:threeAnswersState.first,payment_mode:'card_to_card',payment_status:'waiting payment'},
            {
                card_num:threeAnswersState.second,
                card_name:threeAnswersState.third,
                updated_at:date.toLocaleString()
            }
        );
        await ctx.reply('✅ اطلاعات شما ثبت شد. در فواصل زمانی متفاوت گزینه بررسی پرداخت را چک نمایید.')
        resetAllStates(ctx.chat.id)
        resetAllAnswers(ctx.chat.id)
    }


}








module.exports={
    sendCardProcess
}