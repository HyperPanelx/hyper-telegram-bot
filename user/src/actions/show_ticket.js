const {bot} = require("../bot.config");
const {queryValidation, generateCommands} = require("../utils/utils")
const ticketModel=require('../models/Ticket')

bot.action('show_ticket',async (ctx)=>{
    await queryValidation(async ()=>{
        const userTickets=await ticketModel.find({bot_id:ctx.from.id});
        const tickets=userTickets.map(item=>{
            return `🔑 شماره تیکت: ${item.ticket_id}\n🗝 شماره سفارش: ${item.order_id}\n✍️ عنوان تیکت: ${item.title}\n🌝 متن پیام: ${item.message}\n 💡 وضعیت تیکت:${item.isActive ? 'فعال' : 'غیر فعال'}\n🧑🏼‍ پاسخ ادمین: ${item.isActive ? 'در انتظار پاسخ' : item.answer}`
        }).join('\n<--------------------------------------->\n');
        await ctx.reply('✅ تیکت های شما به شرح زیر است:\n'+tickets)
        await generateCommands(ctx)
    },ctx,true,false)
})

