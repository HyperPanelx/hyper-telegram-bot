const {extractIps, getServerLocation, generateCommands, getOrderData, requestAuthority,createPayLink,createPaypalOrder,createCardToCardOrder} = require("./utils");
const {shareData} = require("./shareData");
const {resetAllStates, getTwoQuestionState, getThreeQuestionState} = require("./states");
const {resetAllAnswers, getTwoAnswersState, getThreeAnswersState} = require("./answers");
const nanoid = require("nanoid");
const transactionModel = require("../models/Transaction");
const {bot} = require("../bot.config");


const SelectPlanProcess = async (ctx,plan_id) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    threeQuestionState.first=false
    /// set plan id
    threeAnswersState.first=plan_id
    const server_list=extractIps(shareData.servers_list);
    if(server_list){
        await ctx.reply('لطفا چند لحظه صبر کنید...')
        const getLocations=await getServerLocation(server_list);
        const edited_servers_list=getLocations.map((item,index)=>{
            return [{text:`Location ${index+1}: ${item.countryCode} - ${item.countryName}`,callback_data:`select_server-${item.ip}`}];
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



const selectServersProcess = async (ctx,ip) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    threeQuestionState.second=false
    /// set location
    threeAnswersState.second=ip;

    await ctx.reply('✅ انتخاب روش پرداخت: ',{
        reply_markup:{
            inline_keyboard:[
                [{text:'پرداخت از طریق درگاه زرین پال',callback_data:'select_method-1'}],
                [{text:'پرداخت از طریق کارت به کارت',callback_data:'select_method-2'}],
            ]
        }
    })
}


const selectPaymentMethod = async (ctx,id) => {
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const threeAnswersState=getThreeAnswersState(ctx.chat.id);
    threeQuestionState.second=false
    /// set location
    threeAnswersState.third=id;

    /// order data
    const order_data=getOrderData(threeAnswersState.first,threeAnswersState.second,threeAnswersState.third);
    const order_id=nanoid.nanoid(28);
    const date=new Date();
    await ctx.reply('لطفا چند لحظه صبر کنید...')

    if(threeAnswersState.third===1){
        /// paypal

        // //// get authority
        const authority=await requestAuthority(order_data.plan.price,ctx.botInfo.username,order_id);
        if(authority ){
            const newTransaction=new transactionModel({
                bot_id:ctx.from.id,
                pay_amount:order_data.plan.price,
                order_id:order_id,
                transaction_id:authority,
                plan_id:order_data.plan.id,
                target_server:order_data.server.api,
                target_multi:order_data.server.multi,
                payment_mode:order_data.method,
                payment_status:'waiting payment',
                created_at:date.toLocaleString(),
                updated_at:date.toLocaleString(),
                card_num:'',
                ref_id:''
            });
            newTransaction.save().then(async ()=>{
                await createPaypalOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,order_id,authority,false)
            })
        }else{
            ctx.reply('❌ متاسفانه اشکالی در زرین پال پیش آمده است. لطفا بعدا تلاش کنید!')
            await generateCommands(ctx)
        }

    }else{
        /// card to card
        const newTransaction=new transactionModel({
            bot_id:ctx.from.id,
            pay_amount:order_data.plan.price,
            order_id:order_id,
            transaction_id:order_id,
            plan_id:order_data.plan.id,
            target_server:order_data.server.api,
            target_multi:order_data.server.multi,
            payment_mode:order_data.method,
            payment_status:'waiting payment',
            created_at:date.toLocaleString(),
            updated_at:date.toLocaleString(),
            submit_stage:0,
            card_num:'',
            card_name:'',
        });
        newTransaction.save().then(async ()=>{
            await createCardToCardOrder(ctx,order_data.plan.duration,order_data.plan.multi,order_data.plan.price,order_id,false)
        })
    }

    resetAllStates(ctx.chat.id)
    resetAllAnswers(ctx.chat.id)
}


module.exports={
    SelectPlanProcess,selectServersProcess,selectPaymentMethod
}