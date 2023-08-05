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
        const getLocations=await getServerLocation(server_list);
        const edited_servers_list=getLocations.map((item,index)=>{
            return [{text:`${index+1}. ${item.countryCode} - ${item.countryName}`,callback_data:`select_server-${item.ip}`}];
        });
        ctx.reply('✅ Our available servers.\n❔ Choose a location:',{
            reply_markup:{
                inline_keyboard:[
                    ...edited_servers_list
                ]
            }
        })
    }else{
        ctx.reply('❌ sorry but there is not any available server! contact admins.')
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
        ctx.reply('❌ sorry but there is something wrong with zarin pal.')
        await generateCommands(ctx)
    }
    resetAllStates(ctx.chat.id)
    resetAllAnswers(ctx.chat.id)
}


module.exports={
    SelectPlanProcess,selectServersProcess
}