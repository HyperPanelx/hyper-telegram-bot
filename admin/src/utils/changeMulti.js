const {changeMulti,generateCommands}=require('./utils')
const {resetAllStates, getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')


const changeMultiProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// username
        twoAnswersState.first=txt
        await ctx.reply('Enter new multi:');

    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// new multi
        twoAnswersState.second=txt
        const isCreated=await changeMulti(ctx,twoAnswersState.first,twoAnswersState.second);
        if(isCreated){
            await ctx.reply(`✅ user multi changed successfully!`);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!');
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id)
    }
}

module.exports={
    changeMultiProcess
}

