
const {resetAllStates, getOneQuestionState}=require('./states')
const {resetAllAnswers, getOneAnswersState}=require('./answers')
const transactionModel=require('../models/Transaction')
const userModel=require('../models/User')
const planModel=require('../models/Plan')
const getTransactionProcess = async (ctx,txt) => {
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const oneAnswerState=getOneAnswersState(ctx.chat.id);

  if(oneQuestionState && oneQuestionState.first){
      // order id
      oneAnswerState.first=txt
      const getTransactionFromDb=await transactionModel.findOne({order_id:oneAnswerState.first});
      if(getTransactionFromDb){
          const {order_id,transaction_id,plan_id,target_server,payment_status,card_num,ref_id,bot_id,created_at,updated_at}=getTransactionFromDb;
          const getPlan=await planModel.findOne({plan_id:plan_id});
          const getUserData=await userModel.findOne({bot_id});
          const {tel_name,tel_username,phone}=getUserData;
          const {duration,multi,price}=getPlan;
          const detail=`✅ اطلاعات سفارش یافت شد!\n🗝 شماره سفارش:${order_id}\n🔑 شماره تراکنش زرین پال: ${transaction_id}\n⚡️ کد رهگیری زرین پال: ${ref_id || ''}\n🧑🏼‍ اطلاعات اکانت: ${duration} ماه- ${multi}  کاربر همزمان - ${price} هزار تومان`+`
💡 وضعیت پرداخت: ${payment_status==='success' ? 'موفق' :payment_status==='waiting payment' ? 'در انتظار پرداخت' : 'ناموفق'}`+`
 📡 سرور انتخاب شده توسط کاربر: ${target_server}`+`\n⏰ زمان اخرین اپدیت: ${updated_at}`+`\n⏰ زمان ساخت تراکنش: ${created_at}`+`
💳 شماره کارت : ${card_num || ''}`+`\n👨🏼‍💼نام کاربر: ${tel_name || ''}\n👨🏼‍💼 نام کاربری تلگرام: ${tel_username || ''}\n📱 شماره موبایل کاربر: ${phone}`
          await ctx.reply(detail,{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          })
      }else{
          await ctx.reply('❌ تراکنشی با این شماره سفارش یافت نشد!',{
              reply_markup: {
                  inline_keyboard: [
                      [{text: '🗓نمایش منو', callback_data: 'show_menu'}],
                  ]
              }
          })
      }
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
  }
}

module.exports= {
    getTransactionProcess
}