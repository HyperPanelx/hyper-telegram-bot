require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
////
const {resetAllStates,getThreeQuestionState,getFourQuestionState,getTwoQuestionState,getOneQuestionState}=require('../utils/states');
const {resetAllAnswers,getThreeAnswersState}=require('../utils/answers')
const {generateCommands,getMe}=require('../utils/utils');
const {addServerProcess, serverData}=require('../utils/addServer');
const {generateUserProcess}=require('../utils/generateUser');
const {deleteUserProcess}=require('../utils/deleteUser');
const {unlockUserProcess}=require('../utils/unlockUser');
const {lockUserProcess}=require('../utils/lockUser');
const {resetUserPassProcess}=require('../utils/resetPass');
const {createAdminProcess}=require('../utils/createAdmin');
const {deleteAdminUserProcess}=require('../utils/deleteAdminUser');
const {changeMultiProcess}=require('../utils/changeMulti');
const {addPaypalProcess}=require('../utils/addPaypal');
const {getIPProcess}=require('../utils/getIP');
const {startAuthProcess}=require('../utils/startAuth');
///////////

bot.command('start', ctx => {
    resetAllStates(ctx.chat.id);
    resetAllAnswers(ctx.chat.id);
    const {id,first_name}=ctx.from;
    adminModel.
    findOne({bot_id:id}).
    then(async response=>{
        if(!response){
            //// first time
            const newUser=new adminModel({
                bot_id:id,
                firstname:first_name,
                referral_token:nanoid.nanoid(32),
                server:[],
                zarinpal_token:''
            });
            newUser.
            save().
            then(()=>{
                ctx.reply(
                    `✅ Hello ${first_name}! Welcome to SSH bot management.\n If you are an admin and using hyper admin panel on your server, we are ready to managing your server (beside web interface) on this bot. \nbut first I need at least on available server to move on.  So let's add your first SSH server!`,
                    {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'add server', callback_data: 'add_server'}],
                        ],
                    }
                })
            })
        }else{
            if(response.server.length===0){
               ctx.reply(
                   `✅ Hello ${first_name}! Welcome to SSH bot management. \n❔ You dont have any available server! do you want add one?`,
                   {
                   reply_markup: {
                       inline_keyboard: [
                           [{ text: '✅ yes', callback_data: 'add_server',  }],
                           [{ text: '❌ no', callback_data: 'cancel_add_server' }],
                       ],
                   },
               })
            }else{
                const servers_list=response.server.map((item)=>{
                    return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
                });
                ctx.reply(
                    `✅ Hello ${first_name}! Welcome to SSH bot management. you have ${response.server.length} available server!`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                ...servers_list,
                                [{text:'add server',callback_data: 'add_server'}],
                            ],
                        }
                    })
            }

        }
    })

})



bot.action('add_server',async (ctx)=>{
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    fourQuestionState.key='add_server'
    fourQuestionState.second=true
    fourQuestionState.third=true
    fourQuestionState.fourth=true
    await ctx.reply('Enter IP address:')
})

bot.action('cancel_add_server',async (ctx)=>{
    await ctx.reply('😪 Maybe later.')
})

bot.action('show_servers',async (ctx)=>{
    const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
    const servers_list=getAdmin.server.map((item)=>{
        return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
    });
    ctx.reply(
        `✅ Available servers:`,
        {
            reply_markup: {
                inline_keyboard: [
                    ...servers_list,
                ],
            }
        })

})

bot.action('change_zarinpal_token',async (ctx)=>{
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    oneQuestionState.key='add_paypal'
    oneQuestionState.first=true
    await ctx.reply('Enter Token:');
})
bot.action('show_to_remove_server',async (ctx)=>{
    const getAdmin=await adminModel.findOne({bot_id:ctx.from.id});
    const servers_list=getAdmin.server.map((item)=>{
        return [{text:item.ip,callback_data: `remove_server-${item.ip}`}]
    });
    ctx.reply(
        `❔ Select server to remove:`,
        {
            reply_markup: {
                inline_keyboard: [
                    ...servers_list,
                ],
            }
        })

})



bot.on('callback_query',async (ctx)=>{
    const query=ctx.update.callback_query.data;
    const getAdminData=await adminModel.findOne({bot_id:ctx.from.id});
    if(query.includes('select_server')){
        const server_ip=query.split('-')[1];
        const token=getAdminData.server.filter(item=>item.ip===server_ip)[0].token;
        const isTokenValid=await getMe(server_ip,token);
        if(isTokenValid){
            serverData.ip=server_ip
            serverData.token=token
            await generateCommands(ctx);
        }else{
            await ctx.reply(`❌ api token is expired! you should start authentication on ${server_ip} again.`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text:'start authentication',callback_data: `start_authentication-${server_ip}`}],
                    ],
                }
            });
        }
    }else if(query.includes('start_authentication')){
        const server_ip=query.split('-')[1];
        const threeQuestionState=getThreeQuestionState(ctx.chat.id);
        const threeAnswersState=getThreeAnswersState(ctx.chat.id);
        threeQuestionState.key='start_authentication';
        threeQuestionState.third=true;
        threeAnswersState.first=server_ip;
        ctx.reply('Enter admin username:')
    }else if(query.includes('remove_server')){
        const server_ip=query.split('-')[1];
        const adminServers=[...getAdminData.server];
        const filterServers=adminServers.filter(item=>item.ip!==server_ip);
        await adminModel.findOneAndUpdate({bot_id:ctx.from.id},{server:filterServers});
        serverData.ip=''
        serverData.token=''
        ctx.reply('✅ server removed successfully! enter /start to continue.')
    }
})





bot.on('message',  async (ctx) =>{
    const txt=ctx.update.message.text;
    const oneQuestionState=getOneQuestionState(ctx.chat.id);
    const twoQuestionState=getTwoQuestionState(ctx.chat.id);
    const threeQuestionState=getThreeQuestionState(ctx.chat.id);
    const fourQuestionState=getFourQuestionState(ctx.chat.id);
    fourQuestionState.key==='add_server' &&  await addServerProcess(ctx,txt);
    threeQuestionState.key==='generate' && await generateUserProcess(ctx,txt);
    oneQuestionState.key==='delete_user' && await deleteUserProcess(ctx,txt);
    oneQuestionState.key==='unlock' && await unlockUserProcess(ctx,txt);
    oneQuestionState.key==='lock' && await lockUserProcess(ctx,txt);
    twoQuestionState.key==='reset_password' && await resetUserPassProcess(ctx,txt);
    threeQuestionState.key==='create_admin' && await createAdminProcess(ctx,txt);
    oneQuestionState.key==='delete_admin' && await deleteAdminUserProcess(ctx,txt);
    twoQuestionState.key==='change_multi' && await changeMultiProcess(ctx,txt);
    oneQuestionState.key==='add_paypal' && await addPaypalProcess(ctx,txt);
    oneQuestionState.key==='get_ip' && await getIPProcess(ctx,txt);
    threeQuestionState.key==='start_authentication' && await startAuthProcess(ctx,txt);
});




