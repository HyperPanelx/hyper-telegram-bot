const {bot}=require('../bot.config');
const {commandValidation}=require('../utils/utils')
const transactionModel=require('../models/Transaction')



bot.action('show_waiting_payment',async (ctx)=>{
    await commandValidation(async ()=>{
       const getTransaction=await transactionModel.find({submit_stage:0,payment_status:'waiting payment',payment_mode:'card_to_card'}).$where('this.card_num.length>0 && this.card_name.length>0');
      if(getTransaction.length>0){
          await Promise.all(getTransaction.map(item=>{
              ctx.reply(`🗝 شماره سفارش: ${item.order_id}\n 💶 مبلغ قابل پرداخت: ${item.pay_amount} هزارتومان\n 💳 شماره کارت پرداخت کننده: ${item.card_num}\n 💳 نام دارنده حساب : ${item.card_name}`,{
                  reply_markup: {
                      inline_keyboard: [
                          [{text: 'تایید', callback_data: `submit_transaction:${item.order_id}`}],
                          [{text: 'لغو', callback_data: `fail_transaction:${item.order_id}`}],
                      ]
                  }
              })
          }))

      }else{
          await ctx.reply('❌ تراکنشی یافت نشد!',{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          });
      }


    },ctx)
})

bot.action(/^submit_transaction/,async ctx=>{
    const order_id=ctx.match['input'].split(':')[1];
    await transactionModel.findOneAndUpdate({order_id:order_id,submit_stage:0,payment_mode:'card_to_card',payment_status:'waiting payment'},{submit_stage:1})

    await ctx.reply('✅ تراکنش تایید شد.',{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          });
})
bot.action(/^fail_transaction/,async ctx=>{
    const order_id=ctx.match['input'].split(':')[1];
   await transactionModel.findOneAndUpdate({order_id:order_id,submit_stage:0,payment_mode:'card_to_card',payment_status:'waiting payment'},{submit_stage:2})

    await ctx.reply('❌ تراکنش لغو شد.',{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          });

})
