const {extractIps, getServerLocation, generateCommands, getOrderData, requestAuthority,createPayLink,createOrder} = require("./utils");
const {shareData} = require("./shareData");
const {resetAllStates, getTwoQuestionState} = require("./states");
const {resetAllAnswers, getTwoAnswersState} = require("./answers");
const nanoid = require("nanoid");
const transactionModel = require("../models/Transaction");


const SelectPlanProcess = async (ctx,query) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);
    twoQuestionState.first=false
    /// set plan id
    twoAnswersState.first=Number(query.split('-')[1]);
    const server_list=extractIps(shareData.servers_list);
    if(server_list){
        await ctx.reply('لطفا چند لحظه صبر کنید...')
        const getLocations=await getServerLocation(server_list);
        const edited_servers_list=getLocations.map((item,index)=>{
            return [{text:`${index+1}. ${item.countryCode} - ${item.countryName}`,callback_data:`select_server-${item.ip}`}];
        });
        await ctx.reply('✅ در حال حاضر سرور ها با موقعیت مکانی زیر موجود می باشد.\nجهت انتخاب روی یک گزینه کلیک نمایید:',{
            reply_markup:{
                inline_keyboard:[
                    ...edited_servers_list
                ]
            }
        })
    }else{
        ctx.reply('❌ متاسفانه سرور فعالی برای این ربات تنظیم نشده است.\nجهت رفع اشکال به ادمین ها پیام دهید.')
        await generateCommands(ctx)
        resetAllStates(ctx.chat.id)
        resetAllAnswers(ctx.chat.id)
    }
}



const selectServersProcess = async (ctx,query) => {
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);
    twoQuestionState.second=false
    /// set location
    twoAnswersState.second=query.split('-')[1];
    /// order data
    const order_data=getOrderData(twoAnswersState.first,twoAnswersState.second);
    //// get authority
    const order_id=nanoid.nanoid(28);
    const authority=await requestAuthority(order_data.plan.price,ctx.botInfo.username,order_id);
    if(authority ){
        await ctx.reply('لطفا چند لحظه صبر کنید...')
        const newTransaction=new transactionModel({
            bot_id:ctx.from.id,
            pay_amount:order_data.plan.price,
            order_id:order_id,
            transaction_id:authority,
            plan_id:order_data.plan.id,
            target_server:order_data.server.ip,
            payment_status:'waiting payment',
            card_num:'',ref_id:''
        });
        newTransaction.save().then(async ()=>{
            await createOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,order_id,authority,false)
        })
    }else{
        ctx.reply('❌ متاسفانه اشکالی در زرین پال پیش آمده است. لطفا بعدا تلاش کنید!')
        await generateCommands(ctx)
    }
    resetAllStates(ctx.chat.id)
    resetAllAnswers(ctx.chat.id)
}


module.exports={
    SelectPlanProcess,selectServersProcess
}