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
        await ctx.reply('Enter expiration date (yyyy-mm-dd):');
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        //exdate
        threeAnswerState.second=txt
        await ctx.reply('Enter count:')
    }else if(threeAnswerState.first && threeAnswerState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
        /// count
        threeAnswerState.third=txt;
        const generatedUser=await generateUser(threeAnswerState.first,threeAnswerState.second,threeAnswerState.third,ctx);
        if(generatedUser){
            await ctx.reply(`✅ users generated successfully!\n\n`+generatedUser)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        }
        resetAllStates(ctx.chat.id);
        resetAllAnswers(ctx.chat.id);
    }
}

module.exports={
    generateUserProcess
}

