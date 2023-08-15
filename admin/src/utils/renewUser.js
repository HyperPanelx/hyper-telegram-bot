
const {resetAllStates, getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')
const {renewUserRequest}=require('./utils')

const renewUserProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// username
        twoAnswersState.first=txt
        await ctx.reply('تاریخ جدید انقضای اکانت به میلادی (yyyy-mm-dd):');

    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// exdate
        twoAnswersState.second=txt
        /// send request
        const renewRequest=await renewUserRequest(ctx,twoAnswersState.first,twoAnswersState.second);
        if(renewRequest){
            await ctx.reply('✅ تاریخ انقضای کاربر با موفقیت تمدید شد.',{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            })
        }else{
            await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.',{
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
    renewUserProcess
}

