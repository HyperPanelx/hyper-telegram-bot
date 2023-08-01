require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const {fourQuestion,threeQuestion,twoQuestion,oneQuestion,resetAllStates}=require('../utils/states');
const {resetAllAnswers}=require('../utils/answers')
let {generateCommands,getMe}=require('../utils/utils');
const {addServerProcess}=require('../utils/addServer');
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


bot.action('select_server',async (ctx)=>{
    await generateCommands(ctx)
})

bot.action('change_paypal_link',async (ctx)=>{
    oneQuestion.key='add_paypal'
    oneQuestion.first=true
    await ctx.reply('Enter link:');
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
});




