const {createAdmin}=require('./utils')
const {resetAllStates,getThreeQuestionState}=require('./states')
const {resetAllAnswers, getThreeAnswersState}=require('./answers')


const createAdminProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);

    if(threeQuestionState&&threeQuestionState.second){
        threeQuestionState.second=false
        /// username
        threeAnswersState.first=txt
        await ctx.reply('پسورد را وارد نمایید:');
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        /// password
        threeAnswersState.second=txt
        await ctx.reply('نقش کاربر:\n0 = دسترسی کامل');
    }else if( threeAnswersState.first && threeAnswersState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
        /// role
        threeAnswersState.third=txt
        const isCreated=await createAdmin(ctx,threeAnswersState.first,threeAnswersState.second,threeAnswersState.third);
        if(isCreated){
            await ctx.reply(`✅ کاربر ادمین با موفقیت اضافه شد.`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            });
        }else{
            await ctx.reply('❌ عدم امکان برقراری ارتباط با سرور.',{
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                    ]
                }
            });
        }
        resetAllAnswers(ctx.chat.id);
        resetAllStates(ctx.chat.id);
    }
}

module.exports={
    createAdminProcess
}

