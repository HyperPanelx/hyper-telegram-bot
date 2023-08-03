const {generateCommands,resetPassword}=require('./utils')
const {resetAllStates,getTwoQuestionState}=require('./states')
const {resetAllAnswers, getTwoAnswersState}=require('./answers')


const resetUserPassProcess = async (ctx,txt) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);

    if(twoQuestionState&&twoQuestionState.second){
        twoQuestionState.second=false
        /// username
        twoAnswersState.first=txt
        await ctx.reply('Enter new password:');
    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// new pass
        twoAnswersState.second=txt
        const isPasswordReset=await resetPassword(ctx,twoAnswersState.first,twoAnswersState.second);
        if(isPasswordReset){
            await ctx.reply(`✅ user's password changed successfully!`)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id);
    }
}

module.exports={
    resetUserPassProcess
}

