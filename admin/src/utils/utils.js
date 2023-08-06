require('dotenv').config()
const f = require("node-fetch");
const adminModel=require('../models/Admin')
const {resetAllStates}=require('./states')
const {resetAllAnswers}=require('./answers')
const {getServerData}=require('./addServer')



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
     const serverDataState=getServerData(ctx.chat.id)
    await ctx.reply(`⚙️ کامند های فعال جهت کنترل سرور: ${serverDataState.ip}:\n💡 /users - لیست کاربران\n💡 /online - لیست کاربران آنلاین\n💡 /generate - تولید یک کاربر \n💡 /delete - حذف کاربر \n💡 /get_ip - دریافت آی پی های فعال روی اکانت \n💡 /unlock - آنلاک کردن کاربر\n💡 /lock - قفل کردن کاربر\n💡 /reset - ریست کردن  رمز کاربر\n💡 /create - ایجاد کاربر با دسترسی ادمین\n💡 /delete_admin - حذف کاربر ادمین\n💡 /referral_token - دریافت توکن معرفی\n💡 /change_multi -  تغییر کاربران همزمان اکانت\n💡 /get_transaction -  دریافت تراکنش با شماره سفارش\n💡 /show_ticket -  مشاهده تیکت های فعال\n💡 /answer_ticket -  پاسخ به تیکت\n💡 /add_paypal - اضافه کردن توکن زرین پال`,{
        reply_markup:{
            inline_keyboard: [
                [{text:'اضافه کردن سرور',callback_data: 'add_server'}],
                [{text:'سویچ کردن بین سرور ها',callback_data: 'show_servers'}],
                [{text:'حذف سرور',callback_data: 'show_to_remove_server'}],
            ],
        }
    })
}


const commandValidation =async (callback,ctx) => {
    const serverDataState=getServerData(ctx.chat.id)
    const adminData=await adminModel.findOne({bot_id:ctx.from.id});
  if(serverDataState.ip && serverDataState.token){
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
      callback()
  }else{
      const servers_list=adminData.server.map((item)=>{
          return [{text:item.ip,callback_data: `select_server-${item.ip}`}]
      });
      ctx.reply(
          `✅ سلا دوست عزیز, شما ${adminData.server.length} سرور فعال دارید. جهت ادامه کار یک سرور را انتخاب کنید.`,
          {
              reply_markup: {
                  inline_keyboard: [
                      ...servers_list,
                      [{text:'اضافه کردن سرور',callback_data: 'add_server'}],
                  ],
              }
          })
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

const generateUser =async (multi,exdate,count,ctx) => {
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({
        multi:Number(multi),
        exdate:exdate,
        count:Number(count),
        server:'localhost',
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


module.exports={
    querySerialize,responseHandler,urlEncode,generateCommands,getMe,commandValidation,getUsersList,getOnlineUsersList,generateUser,deleteUser,unlockUser,lockUser,resetPassword,createAdmin,deleteAdminUser,changeMulti,getIPRequest
}