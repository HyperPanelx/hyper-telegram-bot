const {bot} = require("../bot.config");
const {queryValidation, transformPlanId, generateCommands} = require("../utils/utils");
const transactionModel = require("../models/Transaction");

bot.action('show_transactions',async (ctx)=>{
    await queryValidation(async ()=>{
        const allTransactions=await transactionModel.find({bot_id:ctx.from.id});
        if(allTransactions.length>0){
            const data=transformPlanId(allTransactions)
            const transfered_data=data.map(item=>{
                return `👜 شماره سفارش: ${item._doc.order_id}\n🏆 اطلاعات اکانت: ${item.plan_id.duration} ماه - ${item.plan_id.multi} کاربر همزمان\n💴 مبلغ قابل پرداخت: ${item.plan_id.price} هزار تومان\n🎖 کد رهگیری زرین پال: ${item._doc?.ref_id || ''}\n❔ وضعیت پرداخت: ${item._doc.payment_status==='success' ? 'موفق' :item._doc.payment_status==='failed'?'ناموفق' : 'در انتظار پرداخت'}\n💳 شماره کارت: ${item?._doc?.card_num || ''}`
            }).join('\n<-------------------------------->\n');
            await ctx.reply('✅ تراکنش های شما به شرح زیر است:\n'+transfered_data);
            await generateCommands(ctx);
        }else{
            await ctx.reply('❌ شما در حال حاضر هیچ تراکنش مالی ندارید.');
            await generateCommands(ctx);
        }
    },ctx,true,false)
})