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

module.exports={
    querySerialize,responseHandler,urlEncode,validateServer,generateCommands,states,userState,
    answers,serverData,getMe
}