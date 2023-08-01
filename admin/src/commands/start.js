require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const {fourQuestion,threeQuestion,twoQuestion,oneQuestion,resetAllStates}=require('../utils/states');
const {resetAllAnswers, threeAnswers}=require('../utils/answers')
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
    resetAllStates();
    resetAllAnswers();
    const {id,first_name}=ctx.from;
    adminModel.
    find({bot_id:id}).
    then(async response=>{
        if(response.length===0){
            //// first time
            const newUser=new adminModel({
                bot_id:id,
                firstname:first_name,
                referral_token:nanoid.nanoid(32),
                server:[],
                paypal_link:''
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
            if(response[0].server.length===0){
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
                const servers_list=response[0].server.map((item)=>{
                    return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
                });
                ctx.reply(
                    `✅ Hello ${first_name}! Welcome to SSH bot management. you have ${response[0].server.length} available server!`,
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
    fourQuestion.key='add_server'
    fourQuestion.second=true
    fourQuestion.third=true
    fourQuestion.fourth=true
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

bot.action('change_paypal_link',async (ctx)=>{
    oneQuestion.key='add_paypal'
    oneQuestion.first=true
    await ctx.reply('Enter link:');
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
        threeQuestion.key='start_authentication'
        threeQuestion.third=true
        threeAnswers.first=server_ip
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
    fourQuestion.key==='add_server' &&  await addServerProcess(ctx,txt);
    threeQuestion.key==='generate' && await generateUserProcess(ctx,txt);
    oneQuestion.key==='delete_user' && await deleteUserProcess(ctx,txt);
    oneQuestion.key==='unlock' && await unlockUserProcess(ctx,txt);
    oneQuestion.key==='lock' && await lockUserProcess(ctx,txt);
    twoQuestion.key==='reset_password' && await resetUserPassProcess(ctx,txt);
    threeQuestion.key==='create_admin' && await createAdminProcess(ctx,txt);
    oneQuestion.key==='delete_admin' && await deleteAdminUserProcess(ctx,txt);
    twoQuestion.key==='change_multi' && await changeMultiProcess(ctx,txt);
    oneQuestion.key==='add_paypal' && await addPaypalProcess(ctx,txt);
    oneQuestion.key==='get_ip' && await getIPProcess(ctx,txt);
    threeQuestion.key==='start_authentication' && await startAuthProcess(ctx,txt);
});




