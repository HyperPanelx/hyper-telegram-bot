const {bot}=require('../bot.config');
const {getFourQuestionState}=require('../utils/states')
const {commandValidation}=require('../utils/utils')


bot.action('generate_user',async (ctx)=>{
    await commandValidation(async ()=>{
        const fourQuestionState=getFourQuestionState(ctx.chat.id)
        fourQuestionState.key='generate'
        fourQuestionState.second=true
        fourQuestionState.third=true
        fourQuestionState.fourth=true
        await ctx.reply('تعداد کاربر های همزمان را وارد نمایید:')
    },ctx)
})

