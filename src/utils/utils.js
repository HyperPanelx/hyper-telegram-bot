require('dotenv').config()
const {bot}=require('../bot.config')
const f = require("node-fetch");
const userModel=require('../models/User')
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
    const port=process.env.API_PORT;
    try {
        const getMe=await f(`http://${ip}:${port}/panel/me/`,{
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



 const generateCommands = async (chatId,userId) => {
    const user_data=await userModel.findOne({bot_id:userId});
     serverData.token=user_data.token;
     serverData.ip=user_data.server;
    await bot.telegram.sendMessage(chatId,`Available operations:\n1- /users - users list\n2- /online - online users\n3- /generate - generate user \n4- /delete - delete user \n5- /unlock - unlock user\n6- /lock - lock user\n7- /reset - reset password\n8- /create - create admin user`)
}


const commandValidation =async (callback,chatId,userId) => {
    const userData=await userModel.findOne({bot_id:userId});
  if(serverData.ip && serverData.token){
      callback()
  }else{
      await bot.telegram.sendMessage(chatId,
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

const getUsersList = async (ip,token,chatId) => {
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-get?username=all`,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
        const response=await request.json();
        if(response.success){
            return response.data.map(item=>{
                return  `username:  ${item.user}\npassword:  ${item.passwd}\nmulti:  ${item.multi}\nexdate:  ${item.exdate}\nstatus:  ${item.status}\n<----------------------->\n`
            }).join('');
        }else{
            await bot.telegram.sendMessage(chatId,`❌ error in connecting to api!`)
        }

    }catch (err) {
        return  false;
    }
}

const getOnlineUsersList = async (ip,token,chatId) => {
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-active?server=localhost`,{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
        const response=await request.json();
        if(response.users){
            return response.users.map(item=>{
                return  `${item}`
            }).join(', ');
        }else{
            await bot.telegram.sendMessage(chatId,`❌ error in connecting to api!`)
        }

    }catch (err) {
        return  false;
    }
};

const generateUser =async (multi,exdate,count,ip,token) => {
    const port=process.env.API_PORT;
    const query=querySerialize({
        multi:Number(multi),
        exdate:exdate,
        count:Number(count),
        server:'localhost',
    });
    try {
        const request=await f(`http://${ip}:${port}/user-gen?`+query,{
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
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-delete?`+query,{
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
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-change-status?`+query,{
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
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-change-status?`+query,{
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
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/user-change-passwd?`+query,{
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
const createAdmin = async (ip,token,username,pass) => {
    const query=querySerialize({username:username,passwd:pass,role:0});
    const port=process.env.API_PORT;
    try {
        const request=await f(`http://${ip}:${port}/panel/create/?`+query,{
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


module.exports={
    querySerialize,responseHandler,urlEncode,generateCommands,getMe,commandValidation,getUsersList,getOnlineUsersList,generateUser,deleteUser,unlockUser,lockUser,resetPassword,createAdmin
}