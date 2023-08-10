require('dotenv').config()
const f = require("node-fetch");
const adminModel=require('../models/Admin')
const {resetAllStates}=require('./states')
const {resetAllAnswers}=require('./answers')
const {getServerData}=require('./addServer')
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



 const generateMenu = async (ctx) => {
     const serverDataState=getServerData(ctx.chat.id)
    await ctx.reply(`⚙️🌎 عملیات های فعال جهت کنترل سرور ${serverDataState.ip}:`,{
        reply_markup:{
            inline_keyboard: [
                [
                    {text:'👨🏼‍💼لیست کاربران',callback_data: 'users_list'},
                    {text:'💡لیست کاربران آنلاین',callback_data: 'online_list'}
                ],
                [
                    {text:'💡لیست کاربران آنلاین',callback_data: 'online_list'},
                    {text:'⚡️تولید کاربر',callback_data: 'generate_user'}
                ],
                [
                    {text:'🗑حذف یک کاربر',callback_data: 'delete_user'},
                    {text:'⚡️اضافه کردن مولتی سرور',callback_data: 'add_multi'}
                ],
                [
                    {text:'👀مشاهده مولتی سرور',callback_data: 'show_multi'},
                    {text:'💡دریافت آی پی فعال اکانت',callback_data: 'get_ip'}
                ],
                [
                    {text:'🔓آنلاک کردن کاربر',callback_data: 'unlock_user'},
                    {text:'🔓قفل کردن کاربر',callback_data: 'lock_user'}
                ],
                [
                    {text:'♻️ریست کردن رمز کاربر',callback_data: 'reset_password'},
                    {text:'👤ایجاد کاربر ادمین',callback_data: 'create_admin'}
                ],
                [
                    {text:'🗑حذف کاربر ادمین',callback_data: 'delete_admin'},
                    {text:'⚡️دریافت توکن معرفی',callback_data: 'get_referral'}

                ],
                [
                    {text:'🎗تغییر کاربران همزمان اکانت',callback_data: 'change_multi'},
                    {text:'💶دریافت تراکنش با شماره سفارش',callback_data: 'get_transaction'}
                ],
                [
                    {text:'👀مشاهده تیکت های فعال',callback_data: 'show_ticket'},
                    {text:'✍پاسخ به تیکت',callback_data: 'answer_ticket'}
                ],
                [
                    {text:'⚡️اضافه کردن توکن زرین پال',callback_data: 'add_paypal'},
                    {text:'🗑حذف سرور',callback_data: 'remove_server'}
                ],
            ],
        }
    })
}


const commandValidation =async (callback,ctx) => {
    const serverDataState=getServerData(ctx.chat.id);
    const adminData=await adminModel.findOne({bot_id:ctx.from.id});
  if(serverDataState.ip && serverDataState.token){
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
      callback()
  }else{
      if(adminData){
          ctx.reply(
              `✅ سلام دوست عزیز, شما یک سرور فعال دارید. جهت ادامه کار یک آنرا انتخاب کنید.`,
              {
                  reply_markup: {
                      inline_keyboard: [
                          [{text:adminData.server.ip+` - ssh: ${adminData.server.ssh_port}`,callback_data: `select_server`}]
                      ],
                  }
              })
      }

  }
}

const getUsersList = async (ctx) => {
    const serverDataState=getServerData(ctx.chat.id)
    try {
        const request=await f(`http://${serverDataState.ip}/user-get?username=all`,{
            headers:{
                'Authorization':`Bearer ${serverDataState.token}`
            }
        })
        const response=await request.json();
        if(response.success){
            return response.data.map(item=>{
                return  `👨🏼‍💼نام کاربری:  ${item.user}\nرمز عبور:  ${item.passwd}\nتعداد کاربر همزمان:  ${item.multi}\nتاریخ انقضا:  ${item.exdate}\nوضعیت:  ${item.status==='enable' ? 'فعال' : 'غیر فعال'}\n<--------------------------------------->\n`
            }).join('');
        }else{
            return false
        }

    }catch (err) {
        return  false;
    }
}

const getOnlineUsersList = async (ctx) => {
    const serverDataState=getServerData(ctx.chat.id)
    try {
        const request=await f(`http://${serverDataState.ip}/user-active?server=localhost`,{
            headers:{
                'Authorization':`Bearer ${serverDataState.token}`
            }
        });
        const response=await request.json();
        if(response.users){
            const responseEntries=Object.entries(response.users);
            return responseEntries.map(item=>{
                return  `👨🏼‍💼 نام کاربری: ${item[0]}\n📱 تعداد دستگاه متصل: ${item[1]}`
            }).join('\n<-------------------------------------------->\n');
        }else{
            return false
        }

    }catch (err) {
        return  false;
    }
};

const generateUser =async (multi,exdate,count,ip,ctx) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({
        multi:Number(multi),
        exdate:exdate,
        count:Number(count),
        server:ip || 'localhost',
    });
    try {
        const request=await f(`http://${serverDataState.ip}/user-gen?`+query,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        if(response.success){
            return response.data.map(item=>{
                return  `نام کاربری: ${item.user}\nرمز عبور: ${item.passwd}`
            }).join('\n<----------------------------------->\n');
        }else{
            return false
        }
    }catch (err) {
        return false
    }
}

const deleteUser = async (ctx,username) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({username:username,server:'localhost'})
    try {
        const request=await f(`http://${serverDataState.ip}/user-delete?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const unlockUser = async (ctx,username) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({status :'unlock',username:username,server:'localhost'})
    try {
        const request=await f(`http://${serverDataState.ip}/user-change-status?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}
const lockUser = async (ctx,username) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({status :'lock',username:username,server:'localhost'})
    try {
        const request=await f(`http://${serverDataState.ip}/user-change-status?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}


const resetPassword = async (ctx,username,new_pass) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({mode:'users',username:username,server:'localhost',passwd:new_pass})
    try {
        const request=await f(`http://${serverDataState.ip}/user-change-passwd?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return true;
    }catch (err) {
        return false
    }

}
const createAdmin = async (ctx,username,pass,role) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({username:username,passwd:pass,role:Number(role)});
    try {
        const request=await f(`http://${serverDataState.ip}/panel/create/?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const deleteAdminUser = async (ctx,username) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({username:username})
    try {
        const request=await f(`http://${serverDataState.ip}/panel/delete/?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}


const changeMulti=async (ctx,username,new_multi)=>{
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({username:username,multi:Number(new_multi)})
    try {
        const request=await f(`http://${serverDataState.ip}/user-change-multi?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const getIPRequest=async (ctx,username,new_multi)=>{
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({username:username,multi:Number(new_multi)})
    try {
        const request=await f(`http://${serverDataState.ip}/user-active-ip?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
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

const addMultiRequest=async (ctx,ip,username,password,port)=>{
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({
        ip_address:ip,
        port:port,
        user:username,
        password:password
    })
    try {
        const request=await f(`http://${serverDataState.ip}/server-add?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success;
    }catch (err) {
        return false
    }

}

const getMultiRequest=async (ctx)=>{
    const serverDataState=getServerData(ctx.chat.id)
    try {
        const request=await f(`http://${serverDataState.ip}/server-list`,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        if(response.success){
            return response.data
        }else{
            return false
        }
    }catch (err) {
        return false
    }

}
module.exports={
    querySerialize,responseHandler,urlEncode,generateMenu,getMe,commandValidation,getUsersList,getOnlineUsersList,generateUser,deleteUser,unlockUser,lockUser,resetPassword,createAdmin,deleteAdminUser,changeMulti,getIPRequest,addMultiRequest,getMultiRequest
}