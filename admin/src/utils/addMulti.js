const { getFourQuestionState,resetAllStates}=require('./states')
const { getFourAnswersState,resetAllAnswers}=require('./answers')
const {addMultiRequest}=require('./utils')
const adminModel=require('../models/Admin')

const addMultiServerProcess = async (ctx,txt) => {
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    const fourAnswerState=getFourAnswersState(ctx.chat.id);

    if(fourQuestionState && fourQuestionState.second){
        fourQuestionState.second=false
        /// ip
        fourAnswerState.first=txt

        await ctx.reply('نام کاربری ادمین را وارد نمایید:')
    }else if(fourQuestionState.third){
        fourQuestionState.third=false
        // username
        fourAnswerState.second=txt

        await ctx.reply('پسورد ادمین را وارد نمایید:')
    }else if(fourQuestionState.fourth){
        fourQuestionState.fourth=false
        // password
        fourAnswerState.third=txt

        await ctx.reply('پورت را وارد نمایید:')
    } else if(fourAnswerState.first && fourAnswerState.second && fourAnswerState.third && !fourQuestionState.first && !fourQuestionState.second && !fourQuestionState.third && !fourQuestionState.fourth){
        /// port
        fourAnswerState.fourth=txt;
        // request
        const isAdded=await addMultiRequest(ctx,fourAnswerState.first,fourAnswerState.second,fourAnswerState.third,fourAnswerState.fourth)
        if(isAdded){
            await ctx.reply('✅ سرور با موفقیت اضافه شد.',{
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

        resetAllStates(ctx.chat.id)
        resetAllAnswers(ctx.chat.id)
    }
}

module.exports={
    addMultiServerProcess
}