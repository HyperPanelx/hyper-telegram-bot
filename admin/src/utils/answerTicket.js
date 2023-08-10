
const {resetAllStates, getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')
const ticketModel=require('../models/Ticket')

const answerTicketProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// ticket num
        twoAnswersState.first=txt
        await ctx.reply('متن پیام خود را وارد نمایید');

    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// message
        twoAnswersState.second=txt
        const isTicketNumberValid=await ticketModel.findOne({ticket_id:twoAnswersState.first});
        if(isTicketNumberValid){
            await ticketModel.
            findOneAndUpdate({ticket_id:twoAnswersState.first},{answer:twoAnswersState.second,isActive:false});
            await ctx.reply('✅ پیغام شما برای کاربر ارسال شد.',{
                reply_markup: {
                   inline_keyboard: [
                       [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                   ]
               }
            })
        }else{
            await ctx.reply('❌ شماره تیکت پیدا نشد.',{
                reply_markup: {
                   inline_keyboard: [
                       [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                   ]
               }
            })
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id)

    }
}

module.exports={
    answerTicketProcess
}

