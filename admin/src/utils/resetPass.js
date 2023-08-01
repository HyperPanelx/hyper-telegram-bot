const {generateCommands,resetPassword}=require('./utils')
const {serverData} = require("./addServer");
const {twoQuestion,resetAllStates}=require('./states')
const {twoAnswers,resetAllAnswers}=require('./answers')


const resetUserPassProcess = async (ctx,txt) => {
    if(twoQuestion.second){
        twoQuestion.second=false
        /// username
        twoAnswers.first=txt
        await ctx.reply('Enter new password:');
    }else if( twoAnswers.first && !twoQuestion.first && !twoQuestion.second){
        /// new pass
        twoAnswers.second=txt
        const isPasswordReset=await resetPassword(serverData.ip,serverData.token,twoAnswers.first,twoAnswers.second);
        if(isPasswordReset){
            await ctx.reply(`✅ user's password changed successfully!`)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        }
        resetAllAnswers();
        resetAllStates();
    }
}

module.exports={
    resetUserPassProcess
}

