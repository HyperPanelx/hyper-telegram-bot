require('dotenv').config()
const {bot}=require('../bot.config')
const f = require("node-fetch");
const adminModel=require('../models/Admin')
const {resetAllStates}=require('./states')
const {resetAllAnswers}=require('./answers')
const {serverData}=require('./addServer')

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


const urlEncode = (obj) => {
  const toArray=Object.entries(obj);
  const url=new URLSearchParams();
  toArray.forEach(item=>{
      url.append(item[0],item[1])
  })
  return url
}



const getMe = async (ip,token) => {
    try {
        const getMe=await f(`http://${ip}/panel/me/`,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
        const response=await getMe.json();
        return !!response.username;
    }catch (err) {
        return  false;
    }
}



 const generateCommands = async (ctx) => {
    const user_data=await adminModel.findOne({bot_id:ctx.from.id});
     serverData.token=user_data.token;
     serverData.ip=user_data.server;
    await ctx.reply(`⚒ Available operations:\n💡 /users - users list\n💡 /online - online users\n💡 /generate - generate user \n💡 /delete - delete user \n💡 /get_ip - get user connections ip \n💡 /unlock - unlock user\n💡 /lock - lock user\n💡 /reset - reset password\n💡 /create - create admin user\n💡 /delete_admin - delete admin user\n💡 /referral_token - get referral token\n💡 /change_multi -  change user multi\n💡 /add_paypal -  add your paypal link`,{
        reply_markup:{
            inline_keyboard: [
                [{text:'switch server',callback_data: 'add_server'}]
            ],
        }
    })
}


const commandValidation =async (callback,ctx) => {
    const userData=await adminModel.findOne({bot_id:ctx.from.id});
  if(serverData.ip && serverData.token){
      resetAllAnswers();
      resetAllStates();
      callback()
  }else{
      await bot.telegram.sendMessage(ctx.chat.id,
          `✅ Hello ${userData.firstname}! Welcome to SSH bot management. you have 1 available server!`,
          {
              reply_markup: {
                  inline_keyboard: [
                      [{text:userData.server,callback_data: 'select_server'}]
                  ],
              }
          })
  }
}

const getUsersList = async (ip,token) => {
    try {
        const request=await f(`http://${ip}/user-get?username=all`,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
        const response=await request.json();
        if(response.success){
            return response.data.map(item=>{
                return  `👨🏼‍💼username:  ${item.user}\npassword:  ${item.passwd}\nmulti:  ${item.multi}\nexdate:  ${item.exdate}\nstatus:  ${item.status}\n<----------------------->\n`
            }).join('');
        }else{
            return false
        }

    }catch (err) {
        return  false;
    }
}

const getOnlineUsersList = async (ip,token) => {
    try {
        const request=await f(`http://${ip}/user-active?server=localhost`,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        });
        const response=await request.json();
        if(response.users){
            const responseEntries=Object.entries(response.users);
            return responseEntries.map(item=>{
                return  `👨🏼‍💼 username: ${item[0]}\n📱 connections: ${item[1]}`
            }).join('\n<--------------------------->\n');
        }else{
            return false
        }

    }catch (err) {
        return  false;
    }
};

const generateUser =async (multi,exdate,count,ip,token) => {
    const query=querySerialize({
        multi:Number(multi),
        exdate:exdate,
        count:Number(count),
        server:'localhost',
    });
    try {
        const request=await f(`http://${ip}/user-gen?`+query,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        if(response.success){
            return response.data.map(item=>{
                return  `username: ${item.user}\npassword: ${item.passwd}`
            }).join('\n<----------------->\n');
        }else{
            return false
        }
    }catch (err) {
        return false
    }
}

const deleteUser = async (ip,token,username) => {
    const query=querySerialize({username:username,server:'localhost'})
    try {
        const request=await f(`http://${ip}/user-delete?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const unlockUser = async (ip,token,username) => {
    const query=querySerialize({status :'unlock',username:username,server:'localhost'})
    try {
        const request=await f(`http://${ip}/user-change-status?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}
const lockUser = async (ip,token,username) => {
    const query=querySerialize({status :'lock',username:username,server:'localhost'})
    try {
        const request=await f(`http://${ip}/user-change-status?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}


const resetPassword = async (ip,token,username,new_pass) => {
    const query=querySerialize({mode:'users',username:username,server:'localhost',passwd:new_pass})
    try {
        const request=await f(`http://${ip}/user-change-passwd?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return true;
    }catch (err) {
        return false
    }

}
const createAdmin = async (ip,token,username,pass,role) => {
    const query=querySerialize({username:username,passwd:pass,role:Number(role)});
    try {
        const request=await f(`http://${ip}/panel/create/?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const deleteAdminUser = async (ip,token,username) => {
    const query=querySerialize({username:username})
    try {
        const request=await f(`http://${ip}/panel/delete/?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}


const changeMulti=async (ip,token,username,new_multi)=>{
    const query=querySerialize({username:username,multi:Number(new_multi)})
    try {
        const request=await f(`http://${ip}/user-change-multi?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const getIPRequest=async (ip,token,username,new_multi)=>{
    const query=querySerialize({username:username,multi:Number(new_multi)})
    try {
        const request=await f(`http://${ip}/user-active-ip?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        if(response.success){
            return  response.data[0].client_ip
        }else{
            return  false
        }
    }catch (err) {
        return false
    }

}


module.exports={
    querySerialize,responseHandler,urlEncode,generateCommands,getMe,commandValidation,getUsersList,getOnlineUsersList,generateUser,deleteUser,unlockUser,lockUser,resetPassword,createAdmin,deleteAdminUser,changeMulti,getIPRequest
}