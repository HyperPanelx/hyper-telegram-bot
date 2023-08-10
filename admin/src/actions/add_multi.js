const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getFourQuestionState} = require("../utils/states");



bot.action('add_multi',async (ctx)=>{
    await commandValidation(async ()=>{
        const fourQuestionState=getFourQuestionState(ctx.chat.id);
        fourQuestionState.key='add_multi'
        fourQuestionState.second=true
        fourQuestionState.third=true
        fourQuestionState.fourth=true
        await ctx.reply('آی پی آدرس سرور را وارد نمایید:')
    },ctx)
})

