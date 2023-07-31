require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
let {generateCommands,getMe}=require('../utils/utils');
const {userAddServerState,addServerProcess}=require('../utils/addServer');
const {generateUserProcess}=require('../utils/generateUser');
const {deleteUserProcess}=require('../utils/deleteUser');
const {unlockUserProcess}=require('../utils/unlockUser');
const {lockUserProcess}=require('../utils/lockUser');
const {resetUserPassProcess}=require('../utils/resetPass');
const {createAdminProcess}=require('../utils/createAdmin');
const {deleteAdminUserProcess}=require('../utils/deleteAdminUser');
const {changeMultiProcess}=require('../utils/changeMulti');
const {addPaypalProcess, addPaypalData}=require('../utils/addPaypal');
///////////

bot.command('start', ctx => {
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
                server:'',
                token:'',
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
                const isTokenValid=await getMe(response[0].server,response[0].token)
                if(!isTokenValid){
                    ctx.reply(`🚫 ${response[0].server} server need to be authenticated again.`,{
                        reply_markup: {
                            inline_keyboard: [
                                [{text:'start authentication',callback_data: 'add_server'}]
                            ],
                        }
                    })
                }else{
                    ctx.reply(
                        `✅ Hello ${first_name}! Welcome to SSH bot management. you have 1 available server!`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{text:response[0].server,callback_data: 'select_server'}]
                                ],
                            }
                        })
                }
            }

        }
    })

})

bot.on('callback_query', async (callbackQuery) => {
    const query = callbackQuery.update.callback_query.data;
    const chatId=callbackQuery.chat.id;
    switch (query) {
        case 'add_server':{
            const userData=userAddServerState(chatId);
            callbackQuery.state.addServer=true
            userData.waitingForUsername=true
            userData.waitingForPassword=true
            userData.waitingForPort=true
            await bot.telegram.sendMessage(chatId,'Enter IP address:')
        }
        break
        case 'cancel_add_server':{
           await bot.telegram.sendMessage(chatId,'😪 Maybe later.')
        }
        break
        case 'select_server':{
            const userId=callbackQuery.from.id
            await generateCommands(chatId,userId)
        }
        break
        case 'change_paypal_link':{
            addPaypalData.state=true
            await bot.telegram.sendMessage(chatId,'Enter link:');
        }
        break
    }

})



bot.on('message',  async (message) =>{
    const chatId=message.chat.id;
    const txt=message.update.message.text;
    const userId=message.update.message.from.id;
    await addServerProcess(chatId,txt,userId);
    await generateUserProcess(chatId,txt,userId);
    await deleteUserProcess(chatId,txt,userId);
    await unlockUserProcess(chatId,txt,userId);
    await lockUserProcess(chatId,txt,userId);
    await resetUserPassProcess(chatId,txt,userId);
    await createAdminProcess(chatId,txt,userId);
    await deleteAdminUserProcess(chatId,txt,userId);
    await changeMultiProcess(chatId,txt,userId);
    await addPaypalProcess(chatId,txt,userId);
});




