const {createAdmin,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {threeQuestion,resetAllStates}=require('./states')
const {threeAnswers,resetAllAnswers}=require('./answers')


const createAdminProcess = async (ctx,txt) => {
    if(threeQuestion.second){
        threeQuestion.second=false
        /// username
        threeAnswers.first=txt
        await ctx.reply('Enter new password:');
    }else if(threeQuestion.third){
        threeQuestion.third=false
        /// password
        threeAnswers.second=txt
        await ctx.reply('Enter role:\n0 = full access');
    }else if( threeAnswers.first && threeAnswers.second && !threeQuestion.first && !threeQuestion.second && !threeQuestion.third){
        /// role
        threeAnswers.third=txt
        const isCreated=await createAdmin(serverData.ip,serverData.token,threeAnswers.first,threeAnswers.second,threeAnswers.third);
        if(isCreated){
            await ctx.reply(`✅ admin user created successfully!`);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!');
        }
        resetAllAnswers();
        resetAllStates();
    }
}

module.exports={
    createAdminProcess
}

