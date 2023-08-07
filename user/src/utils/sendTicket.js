const {getThreeQuestionState,resetAllStates} = require("./states");
const {getThreeAnswersState,resetAllAnswers} = require("./answers");
const ticketModel=require('../models/Ticket')
const nanoid=require('nanoid')
const {generateCommands, problems}=require('./utils')

const sendTicketProcess = async (ctx,txt) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    if(threeQuestionState.third){
        threeQuestionState.third=false
        /// order id or username
        threeAnswersState.second=txt
        await ctx.reply('پیغام خود را وارد نمایید:')
    }else if(threeAnswersState.first && threeAnswersState.second && !threeQuestionState.first && !threeQuestionState.second && !threeQuestionState.third){
         /// message
        threeAnswersState.third=txt

        const ticketTitle=problems.filter(item=>item.id===threeAnswersState.first)[0].title;
        // new ticket
        const newTicket=new ticketModel({
            ticket_id:nanoid.nanoid(10),
            bot_id:ctx.from.id,
            order_id:threeAnswersState.first===2 ? threeAnswersState.second : '',
            username:threeAnswersState.first===1 ? threeAnswersState.second :'',
            title:ticketTitle,
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