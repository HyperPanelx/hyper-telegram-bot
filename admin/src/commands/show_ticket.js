const {bot}=require('../bot.config');
const {commandValidation, generateCommands}=require('../utils/utils')
const ticketModel=require('../models/Ticket')

bot.command('show_ticket',async (ctx)=>{
    await commandValidation(async ()=>{
        const activeTickets=await ticketModel.find({isActive:true});
        if(activeTickets.length>0){
            const tickets=activeTickets.map(item=>{
                return `🔑 شماره تیکت: ${item.ticket_id}\n🗝 شماره سفارش: ${item.order_id || ''}\n👨🏼‍💼 نام کاربری اکانت: ${item.username || ''}\n✍️ عنوان تیکت: ${item.title}\n🌝 متن پیام: ${item.message}`
            }).join('\n<--------------------------------------->\n');
            await ctx.reply('✅ تیکت های فعال:\n'+tickets)
        }else{
            await ctx.reply('❌ تیکتی یافت نشد.')
        }

        await generateCommands(ctx)
    },ctx)
})

