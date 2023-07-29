const {bot}=require('./bot.config')
const f = require("node-fetch");
const userModel=require('./models/User')
//////////////////////
const serverData={
    ip:null,
    token:null
}
const states={};
const answers={
    ip:0,
    username:'',
    password:''
};


///////////////////////
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

const resetUserData = (chatId) => {
    const userData = userState(chatId)
    userData.waitingForCity = false
    userData.waitingForWeather = false
    userData.waitingForTime = false
}
const urlEncode = (obj) => {
  const toArray=Object.entries(obj);
  const url=new URLSearchParams();
  toArray.forEach(item=>{
      url.append(item[0],item[1])
  })
  return url
}

const validateServer =async (ip,username,password) => {
    const port=process.env.API_PORT;
    const userInfo={
        username,password
    }
    try {
        const sendValidationRequest=await f(`http://${ip}:${port}/token`,{
            method:'POST',
            body:urlEncode(userInfo),
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        })
        const response=await sendValidationRequest.json();
        const token=response.access_token ? response.access_token : response.data.access_token;
        return  token ? token : false;
    }catch (err) {
        return  false;
    }
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
    await bot.telegram.sendMessage(chatId,`Available operations:\n1- /users - users list\n2- /online - online users\n3- /generate - generate user \n4- /delete - delete user \n5- /unlock - unlock user\n6- /reset - reset password\n7- /create - create admin user`)
}
const userState = (chatId) => {
    let userData = states[chatId]
    if (!userData) {
        userData = {
            waitingForIP: false,
            waitingForUsername: false,
            waitingForPassword: false,
        }
        states[chatId] = userData
    }
    return userData
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
}

module.exports={
    querySerialize,responseHandler,urlEncode,validateServer,generateCommands,states,userState,
    answers,serverData,getMe,resetUserData,commandValidation,getUsersList,getOnlineUsersList
}