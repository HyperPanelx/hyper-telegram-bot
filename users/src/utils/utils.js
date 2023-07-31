const adminModel=require('../models/Admin')
const { adminData}=require('../utils/adminData')
const {bot} = require("../bot.config");

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

const validateToken =async (token) => {
    const data=await adminModel.findOne({referral_token:token});
    if (data) {
        const {token, paypal_link, server,firstname} = data;
        adminData.server = server
        adminData.token = token
        adminData.paypal_link = paypal_link
        adminData.firstname = firstname
    }
}

const generateCommands = (chatId) => {
  bot.telegram.sendMessage(chatId,`⚒ Available operations:\n💡 /buy - buy an account\n💡 /accounts - see accounts\n💡 /transaction - see all transactions`,{
      reply_markup:{
          inline_keyboard:[
              [{text:'change referral token',callback_data:'add_referral_token'}]
          ]
      }
  })
}

module.exports={
    querySerialize,responseHandler,validateToken,generateCommands
}