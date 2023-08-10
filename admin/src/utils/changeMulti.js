const {changeMulti}=require('./utils')
const {resetAllStates, getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')


const changeMultiProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// username
        twoAnswersState.first=txt
        await ctx.reply('تعداد کاربران همزمان جدید را وارد نمایید:');

    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// new multi
        twoAnswersState.second=txt
        const isCreated=await changeMulti(ctx,twoAnswersState.first,twoAnswersState.second);
        if(isCreated){
            await ctx.reply(`✅ تعداد کاربران همزمان این کاربر با موفقیت تغییر کرد.`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            });
        }else{
            await ctx.reply('❌ عدم امکان برقرای ارتباط با سرور.',{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            });
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id)
    }
}

module.exports={
    changeMultiProcess
}

