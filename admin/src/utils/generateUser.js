const {generateUser,generateCommands}=require('./utils')
const {resetAllStates, getThreeQuestionState} = require("./states");
const {resetAllAnswers, getThreeAnswersState} = require("./answers");


const generateUserProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswerState=getThreeAnswersState(ctx.chat.id);

    if(threeQuestionState && threeQuestionState.second){
        threeQuestionState.second=false
        //// multi
        threeAnswerState.first=txt
        await ctx.reply('تاریخ انقضای اکانت به میلادی (yyyy-mm-dd):');
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        //exdate
        threeAnswerState.second=txt
        await ctx.reply('تعداد اکانت:')
    }else if(threeAnswerState.first && threeAnswerState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
        /// count
        threeAnswerState.third=txt;
        const generatedUser=await generateUser(threeAnswerState.first,threeAnswerState.second,threeAnswerState.third,ctx);
        if(generatedUser){
            await ctx.reply(`✅ اکانت ها با موفقیت ساخته شدند!\n\n`+generatedUser)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
        }
        resetAllStates(ctx.chat.id);
        resetAllAnswers(ctx.chat.id);
    }
}

module.exports={
    generateUserProcess
}

