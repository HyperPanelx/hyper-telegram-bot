const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const {getThreeQuestionState}=require('../utils/states')



bot.command('create',async (ctx)=>{
    await commandValidation(async ()=>{
        const threeQuestionState=getThreeQuestionState(ctx.chat.id)
        threeQuestionState.key='create_admin'
        threeQuestionState.second=true
        threeQuestionState.third=true
        await ctx.reply('نام کاربری را وارد نمایید:')
    },ctx)

})