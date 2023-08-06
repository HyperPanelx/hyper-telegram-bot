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
        await ctx.reply('رمز جدید را وارد نمایید:');
    }else if( twoAnswersState.first && !twoQuestionState.first && !twoQuestionState.second){
        /// new pass
        twoAnswersState.second=txt
        const isPasswordReset=await resetPassword(ctx,twoAnswersState.first,twoAnswersState.second);
        if(isPasswordReset){
            await ctx.reply(`✅ پسورد یوزر با موفقیت تغییر کرد.`)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.')
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id);
    }
}

module.exports={
    resetUserPassProcess
}

