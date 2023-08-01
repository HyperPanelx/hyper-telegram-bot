const {changeMulti,generateCommands}=require('./utils')
const {serverData} = require("./addServer");
const {twoQuestion,resetAllStates}=require('./states')
const {twoAnswers,resetAllAnswers}=require('./answers')


const changeMultiProcess = async (ctx,txt) => {
    if(twoQuestion.second){
        twoQuestion.second=false
        /// username
        twoAnswers.first=txt
        await ctx.reply('Enter new multi:');

    }else if( twoAnswers.first && !twoQuestion.first && !twoQuestion.second){
        /// new multi
        twoAnswers.second=txt
        const isCreated=await changeMulti(serverData.ip,serverData.token,twoAnswers.first,twoAnswers.second);
        if(isCreated){
            await ctx.reply(`✅ user multi changed successfully!`);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ operation failed! enter /start to try again!');
        }
        resetAllAnswers();
        resetAllStates()
    }
}

module.exports={
    changeMultiProcess
}

