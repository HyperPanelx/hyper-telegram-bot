const {getOneQuestionState,resetAllStates} = require("./states");
const {getOneAnswersState,resetAllAnswers} = require("./answers");
const userModel=require('../models/User')
const {generateCommands}=require('../utils/utils')

const addPhoneProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswersState=getOneAnswersState(ctx.chat.id);
    if(oneQuestionState && oneQuestionState.first){
        oneAnswersState.first=txt
        await userModel.findOneAndUpdate({bot_id:ctx.from.id},{phone:oneAnswersState.first})
        await ctx.reply('✅ شماره موبایل شما با موفقیت ثبت شد.')
        await generateCommands(ctx)
    }
    resetAllAnswers(ctx.chat.id)
    resetAllStates(ctx.chat.id)
}




module.exports={
    addPhoneProcess
}