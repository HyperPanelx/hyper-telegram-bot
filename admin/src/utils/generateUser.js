const {generateUser,getMultiRequest,filterMultiServers,showMultiServerToPick}=require('./utils')
const {resetAllStates, getThreeQuestionState, getFourQuestionState} = require("./states");
const {resetAllAnswers, getThreeAnswersState, getFourAnswersState} = require("./answers");
const {bot} = require("../bot.config");


const generateUserProcess = async (ctx,txt) => {
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    const fourAnswerState=getFourAnswersState(ctx.chat.id);

    if(fourQuestionState && fourQuestionState.second){
        fourQuestionState.second=false
        //// multi
        fourAnswerState.first=txt
        await ctx.reply('تاریخ انقضای اکانت به میلادی (yyyy-mm-dd):');
    }else if(fourQuestionState.third){
        fourQuestionState.third=false
        //exdate
        fourAnswerState.second=txt
        await ctx.reply('تعداد اکانت:')
    }else if(fourQuestionState.fourth){
        fourQuestionState.fourth=false;
        /// count
        fourAnswerState.third=txt
        await ctx.reply('در حال دریافت اطلاعات سرور. چند لحظه صبر کنید...')
        await showMultiServerToPick(ctx,'gen_select_multi')
    }
}



bot.action(/gen_select_multi/g,async (ctx)=>{
    const ip=ctx.match['input'].split('-')[1];
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    const fourAnswerState=getFourAnswersState(ctx.chat.id);

    if(fourQuestionState.key==='generate' && !fourQuestionState.first && !fourQuestionState.second && !fourQuestionState.third && !fourQuestionState.fourth && fourAnswerState.first && fourAnswerState.second && fourAnswerState.third){
        fourAnswerState.fourth=ip
         const generatedUser=await generateUser(fourAnswerState.first,fourAnswerState.second,fourAnswerState.third,fourAnswerState.fourth,ctx);
        if(generatedUser){
            await ctx.reply(`✅ اکانت ها با موفقیت ساخته شدند!\n\n`+generatedUser,{
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
        resetAllStates(ctx.chat.id);
        resetAllAnswers(ctx.chat.id);

    }



})



module.exports={
    generateUserProcess
}

