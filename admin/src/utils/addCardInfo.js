
const {resetAllStates, getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')
const adminModel=require('../models/Admin')

const addCardProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// card num
        twoAnswersState.first=txt
        await ctx.reply('نام دارنده این حساب بانکی را وارد نمایید:');

    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// message
        twoAnswersState.second=txt
        ////
        await adminModel.findOneAndUpdate(
            {bot_id:ctx.from.id},
            {
                card_info:{
                    number:twoAnswersState.first,
                    name:twoAnswersState.second
                }
            }
        );
        await ctx.reply('✅ حساب بانکی شما با موفقیت ثبت شد.',{
            reply_markup: {
                inline_keyboard: [
                    [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                ]
            }
        })
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id)

    }
}

module.exports={
    addCardProcess
}

