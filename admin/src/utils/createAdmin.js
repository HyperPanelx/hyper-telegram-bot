const {createAdmin,generateCommands}=require('./utils')
const {resetAllStates,getThreeQuestionState}=require('./states')
const {resetAllAnswers, getThreeAnswersState}=require('./answers')


const createAdminProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);

    if(threeQuestionState&&threeQuestionState.second){
        threeQuestionState.second=false
        /// username
        threeAnswersState.first=txt
        await ctx.reply('Enter new password:');
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        /// password
        threeAnswersState.second=txt
        await ctx.reply('Enter role:\n0 = full access');
    }else if( threeAnswersState.first && threeAnswersState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
        /// role
        threeAnswersState.third=txt
        const isCreated=await createAdmin(ctx,threeAnswersState.first,threeAnswersState.second,threeAnswersState.third);
        if(isCreated){
            await ctx.reply(`✅ admin user created successfully!`);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!');
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id);
    }
}

module.exports={
    createAdminProcess
}

