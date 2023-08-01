const {generateUser,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {threeQuestion,resetAllStates}=require('../utils/states')
const {threeAnswers,resetAllAnswers}=require('../utils/answers')


const generateUserProcess = async (ctx,txt) => {
    if(threeQuestion.second){
        threeQuestion.second=false
        //// multi
        threeAnswers.first=txt
        await ctx.reply('Enter expiration date (yyyy-mm-dd):');
    }else if(threeQuestion.third){
        threeQuestion.third=false
        //exdate
        threeAnswers.second=txt
        await ctx.reply('Enter count:')
    }else if(threeAnswers.first && threeAnswers.second && !threeQuestion.first && !threeQuestion.second && !threeQuestion.third){
        /// count
        threeAnswers.third=txt;
        const generatedUser=await generateUser(threeAnswers.first,threeAnswers.second,threeAnswers.third,serverData.ip,serverData.token);
        if(generatedUser){
            await ctx.reply(`✅ users generated successfully!\n\n`+generatedUser)
            await generateCommands(ctx)
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!')
        }
        resetAllStates();
        resetAllAnswers();
    }
}

module.exports={
    generateUserProcess
}

