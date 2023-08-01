const adminModel=require('../models/Admin')
const { adminData}=require('../utils/adminData')
const userModel=require('../models/User')
const {bot} = require("../bot.config");

const buy_plans=[
    {
        id:1,
        plan:'plan 1',
        price:30000
    },
    {
        id:2,
        plan:'plan 2',
        price:60000
    },
    {
        id:3,
        plan:'plan 3',
        price:90000
    },

]







const querySerialize = (obj) => {
  return Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&');
}

const responseHandler = (error,msg,data) => {
    return JSON.stringify({
        error:error,
        msg:msg,
        data:data
    })
}

const validateToken =async (userId) => {
    const userData=await userModel.findOne({bot_id:userId});
    const data=await adminModel.findOne({referral_token:userData.referral_token});
    if (data) {
        const {token, paypal_link, server,firstname} = data;
        adminData.server = server
        adminData.token = token
        adminData.paypal_link = paypal_link
        adminData.firstname = firstname
    }
}

const generateCommands = (chatId) => {
  bot.telegram.sendMessage(chatId,`⚒ Available operations:\n💡 /buy - buy an account\n💡 /accounts - see all accounts\n💡 /transaction - see all transactions`,{
      reply_markup:{
          inline_keyboard:[
              [{text:'change referral token',callback_data:'add_referral_token'}]
          ]
      }
  })
}


const commandValidation = async (callback,chatId,userId) => {
  if(adminData.firstname && adminData.paypal_link && adminData.server && adminData.token){
      callback()
  }else{
      const userData=await userModel.findOne({bot_id:userId});
      const adminData=await userModel.findOne({referral_token:userData.referral_token});
      await bot.telegram.sendMessage(chatId,`✅ Welcome ${userData.firstname} to hyper vpn provider!`,{
          reply_markup:{
              inline_keyboard:[
                  [{text:`${adminData.firstname} -${userData.referral_token}`,callback_data:'select_referral_token'}]
              ]
          }
      })
  }

}


module.exports={
    querySerialize,responseHandler,validateToken,generateCommands,commandValidation,buy_plans
}