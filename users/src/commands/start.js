require('dotenv').config()
const nanoid=require('nanoid')
const {bot}=require('../bot.config')
const adminModel=require('../models/Admin')
const userModel=require('../models/User')
const {validateToken,generateCommands}=require('../utils/utils')
const {referral_token_state,addReferralTokenProcess}=require('../utils/AddReferral')
const {adminData} = require("../utils/adminData");
///////////




bot.command('start', ctx => {
    const chatId=ctx.chat.id
    const {id,first_name}=ctx.from;
    userModel.
    findOne({bot_id:id}).
    then(async response=>{
       if(response){
           if(response.referral_token.length>0){
               await validateToken(response.referral_token);
               await bot.telegram.sendMessage(chatId,`✅ Welcome ${first_name} to hyper vpn provider!`,{
                   reply_markup:{
                       inline_keyboard:[
                           [{text:`${adminData.firstname} -${response.referral_token}`,callback_data:'select_referral_token'}]
                       ]
                   }
               })

           }else{
               await bot.telegram.sendMessage(chatId,`✅ Welcome ${first_name} to hyper vpn provider!`,{
                   reply_markup:{
                       inline_keyboard:[
                           [{text:'add referral token',callback_data:'add_referral_token'}]
                       ]
                   }
               })
           }

       }else{
           const newUser=new userModel({
               firstname:first_name,
               bot_id:id,
               referral_token:''
           });
           newUser.
           save().
           then(async ()=>{
                await bot.telegram.sendMessage(chatId,`✅ Welcome ${first_name} to hyper vpn provider!`,{
                    reply_markup:{
                        inline_keyboard:[
                            [{text:'add referral token',callback_data:'add_referral_token'}]
                        ]
                    }
                })
           })
       }

    })


})

bot.on('callback_query', async (callbackQuery) => {
    const query = callbackQuery.update.callback_query.data;
    const chatId=callbackQuery.chat.id;
    switch (query) {
        case 'add_referral_token':{
            referral_token_state.state=true
            await bot.telegram.sendMessage(chatId,'Enter referral token:')
        }
        break
        case 'select_referral_token':{
            generateCommands(chatId)
        }
        break
    }

})



bot.on('message',  async (message) =>{
    const chatId=message.chat.id;
    const txt=message.update.message.text;
    const userId=message.update.message.from.id;
    await addReferralTokenProcess(chatId,txt,userId)

});




