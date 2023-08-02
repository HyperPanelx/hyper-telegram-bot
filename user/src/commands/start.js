require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const userModel=require('../models/User');
const {addPhoneProcess}=require('../utils/addPhone')
const {getOneQuestionState,resetAllStates,getTwoQuestionState}=require('../utils/states')
const {getOneAnswersState,resetAllAnswers,getTwoAnswersState}=require('../utils/answers')
const {validateToken,generateCommands, buy_plans, getServerLocation,getAdminsServersList,getPlans,getZarinToken,extractIps,getOrderData,requestPaypal}=require('../utils/utils');

const {shareData}=require('../utils/shareData')
///////////
const { Telegraf, Markup } = require("telegraf");

bot.command('start', async ctx => {
    console.log(ctx)
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    const {id,first_name,username}=ctx.from;
    const userData=await userModel.findOne({bot_id:id});
    if(userData){
        if(userData.phone.length>0){
            await generateCommands(ctx)
        }else{
            const oneQuestionState=getOneQuestionState(ctx.chat.id);
            oneQuestionState.key='add_phone'
            oneQuestionState.first=true
            ctx.reply( `🫡 Hello ${first_name}, Welcome back to Hyper vpn provider. First of all we need your phone number in case that any error occurs:`);
        }
    }else{
        const newUser=new userModel({
            tel_name:first_name || 'unknown',
            tel_username:username || 'unknown',
            bot_id:id,
            phone:'',
            accounts:[]
        });
        await newUser.save();
        const oneQuestionState=getOneQuestionState(ctx.chat.id);
        oneQuestionState.key='add_phone'
        oneQuestionState.first=true
        ctx.reply( `🫡 Hello ${first_name}, Welcome to Hyper vpn provider. First of all we need your phone number in case that any error occurs:`);

    }
})


bot.action('buy_account',async (ctx)=>{
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    twoQuestionState.key='buy_account'
    twoQuestionState.first=true
    twoQuestionState.second=true
    await getPlans(ctx)
})
bot.action('show_account',(ctx)=>{

})

bot.action('show_transactions',(ctx)=>{

})

/// plan
/// server


bot.on('callback_query', async (ctx) => {
    const query=ctx.update.callback_query.data;
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const twoAnswersState=getTwoAnswersState(ctx.chat.id);
    if(twoQuestionState.key==='buy_account'){
        if(query.includes('select_plan') && twoQuestionState.first){
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
                ctx.reply('❌ sorry but there is not any available server! contact to admins.')
                await generateCommands(ctx)
                resetAllStates(ctx.chat.id)
                resetAllAnswers(ctx.chat.id)
            }
        }else if(query.includes('select_server') && twoQuestionState.second){
            twoQuestionState.second=false
            /// set ip
            twoAnswersState.second=query.split('-')[1];
            const order_data=getOrderData(twoAnswersState.first,twoAnswersState.second);
            const req=await requestPaypal(order_data.plan.price,ctx.botInfo.username);
            console.log(req)
            ctx.reply('pay:',{
                reply_markup:{
                    inline_keyboard:[
                        [{text:'link',url:process.env.ZARIN_PAY_LINK+req.data.authority}]
                    ]
                }
            })

        }
    }


})

// {
//     "ip" : "141.11.184.74:6655",
//     "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJob29tYW4iLCJleHAiOjE4MDQ1MTA5MzJ9.iRszq3Ly-XXEdm77aokBcgHhlFIrSnCBZk2igt6eS2Q"
// }

// {
//     "ip" : "166.1.131.76:3939",
//     "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJob29tYW4iLCJleHAiOjE4MDQ1MTk3MDl9.3foUGivIiCioaa7G_3TuaO6o46RPN7qdaYIlN5rMNFw"
// }



bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    console.log(ctx)

    oneQuestionState.key==='add_phone' && await addPhoneProcess(ctx,txt)

});






