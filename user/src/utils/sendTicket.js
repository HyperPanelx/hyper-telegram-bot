const {getThreeQuestionState,resetAllStates} = require("./states");
const {getThreeAnswersState,resetAllAnswers} = require("./answers");
const ticketModel=require('../models/Ticket')
const nanoid=require('nanoid')
const {generateCommands}=require('./utils')

const sendTicketProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    if(threeQuestionState && threeQuestionState.second){
        threeQuestionState.second=false
        /// order id
        threeAnswersState.first=txt
        await ctx.reply('عنوان تیکت را وارد نمایید:')
    }else if(threeQuestionState.third){
        threeQuestionState.third=false
        /// title
        threeAnswersState.second=txt
        await ctx.reply('پیغام خود را وارد نمایید:')
    }else if(threeAnswersState.first && threeAnswersState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
         /// message
        threeAnswersState.third=txt
        //new ticket
        const newTicket=new ticketModel({
            ticket_id:nanoid.nanoid(10),
            bot_id:ctx.from.id,
            order_id:threeAnswersState.first,
            title:threeAnswersState.second,
            message:threeAnswersState.third,
            answer:'',
            isActive:true
        })
        newTicket.save().then(async ()=>{
            await ctx.reply('✅ تیکت شما با موفقیت ایجاد شد.\nدر بخش مشاهده تیکت ها میتواید پاسخ ادمین هارو مشاهده نمایید.')
            await generateCommands(ctx)
        })
        resetAllStates(ctx.chat.id);
        resetAllAnswers(ctx.chat.id);
    }

}



module.exports={
    sendTicketProcess
}