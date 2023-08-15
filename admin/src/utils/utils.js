require('dotenv').config()
const f = require("node-fetch");
const adminModel=require('../models/Admin')
const {resetAllStates}=require('./states')
const {resetAllAnswers}=require('./answers')
const {getServerData}=require('./addServer')
const {bot} = require("../bot.config");
const transactionModel = require("../models/Transaction");



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
                    {text:'🗑حذف یک کاربر',callback_data: 'delete_user'},
                    {text:'⚡️تولید کاربر',callback_data: 'generate_user'}
                ],
                [
                    {text:'👀مشاهده مولتی سرور',callback_data: 'show_multi'},
                    {text:'⚡️اضافه کردن مولتی سرور',callback_data: 'add_multi'}
                ],
                [
                    {text:'♻️ریست کردن رمز کاربر',callback_data: 'reset_password'},
                    {text:'💡دریافت آی پی فعال اکانت',callback_data: 'get_ip'}
                ],
                [
                    {text:'🔓آنلاک کردن کاربر',callback_data: 'unlock_user'},
                    {text:'🔓قفل کردن کاربر',callback_data: 'lock_user'}
                ],
                [
                    {text:'🗑حذف کاربر ادمین',callback_data: 'delete_admin'},
                    {text:'👤ایجاد کاربر ادمین',callback_data: 'create_admin'}
                ],
                [
                    {text:'🎗تغییر کاربران همزمان اکانت',callback_data: 'change_multi'},
                    {text:'⚡️دریافت توکن معرفی',callback_data: 'get_referral'}

                ],
                [
                    {text:'⚡️اضافه کردن توکن زرین پال',callback_data: 'add_paypal'},
                    {text:'💶دریافت تراکنش با شماره سفارش',callback_data: 'get_transaction'}
                ],
                [
                    {text:'👀مشاهده تیکت های فعال',callback_data: 'show_ticket'},
                    {text:'✍پاسخ به تیکت',callback_data: 'answer_ticket'}
                ],
                [
                    {text:'🕔 تراکنش های در انتظار بررسی',callback_data: 'show_waiting_payment'},
                    {text:'🏧 اضافه کردن کارت بانکی',callback_data: 'add_card_info'},
                ],
                [
                    {text:'💡 تمدید کاربر',callback_data: 'renew_user'},
                    {text:'🗑حذف سرور',callback_data: 'remove_server'},
                ],
            ],
        }
    })
}

const transactionNotification =async (ctx) => {
    const getTransaction=await transactionModel.find({submit_stage:0,payment_status:'waiting payment',payment_mode:'card_to_card'}).$where('this.card_num.length>0 && this.card_name.length>0');
    if(getTransaction.length>0){
        await ctx.reply(`⚠️ تعداد ${getTransaction.length} تراکنش جهت بررسی وجود دارد. با انتخاب نمایش تراکنش های در انتظار بررسی اقدام نمایید.`)
    }

}


const commandValidation =async (callback,ctx) => {
    const serverDataState=getServerData(ctx.chat.id);
    const adminData=await adminModel.findOne({bot_id:ctx.from.id});
  if(serverDataState.ip && serverDataState.token){
      resetAllAnswers(ctx.chat.id);
      resetAllStates(ctx.chat.id);
      await transactionNotification(ctx)
      callback()
  }else{
      if(adminData.server.ip && adminData.server.ssh_port){
          await ctx.reply(
              `✅ سلام دوست عزیز, شما یک سرور فعال دارید. جهت ادامه کار یک آنرا انتخاب کنید.`,
              {
                  reply_markup: {
                      inline_keyboard: [
                          [{text:adminData.server.ip+` - ssh: ${adminData.server.ssh_port}`,callback_data: `select_server`}]
                      ],
                  }
              })
      }else{
         await ctx.reply(
              `✅ سلام دوست عزیز,\nخوش آمدید. آیا مایل به اضافه کردن یک سرور هستید؟`,
              {
                  reply_markup: {
                      inline_keyboard: [
                          [{ text: '✅ بله', callback_data: 'add_server',  }],
                          [{ text: '❌ خیر', callback_data: 'cancel_add_server' }],
                      ],
                  },
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
                return  `👨🏼‍💼نام کاربری:  ${item.user}\nرمز عبور:  ${item.passwd}\nتعداد کاربر همزمان:  ${item.multi}\nتاریخ انقضا:  ${item.exdate}\nوضعیت:  ${item.status==='enable' ? 'فعال' : 'غیر فعال'}\n ساخته شده در سرور: ${item.server.length>0 ? item.server : ' localhost'}\n<--------------------------------------->\n`
            }).join('');
        }else{
            return false
        }

    }catch (err) {
        return  false;
    }
}

const getOnlineUsersList = async (ctx,multi) => {
    const serverDataState=getServerData(ctx.chat.id)
    try {
        const request=await f(`http://${serverDataState.ip}/user-active?server=${multi||'localhost'}`,{
            headers:{
                'Authorization':`Bearer ${serverDataState.token}`
            }
        });
        const response=await request.json();
        if(response.users  && Object.keys(response.users).length>0){
            const responseEntries=Object.entries(response.users);
            return responseEntries.map(item=>{
                return  `👨🏼‍💼 نام کاربری: ${item[0]}\n📱 تعداد دستگاه متصل: ${item[1]}`
            }).join('\n<-------------------------------------------->\n');
        }else if(response.data.users && Object.keys(response.data.users).length>0){
            const responseEntries=Object.entries(response.data.users);
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
const renewUserRequest=async (ctx,username,exdate)=>{
    const serverDataState=getServerData(ctx.chat.id)
    const query=querySerialize({
        username,exdate
    })
    try {
        const request=await f(`http://${serverDataState.ip}/user-renew?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverDataState.token}`
            },
        })
        const response=await request.json();
        return !!response.success
    }catch (err) {
        return false
    }

}


const removeDuplicate = (arr,key) => {
    const uniqueServers = [];
    return  arr.filter(element => {
        const isDuplicate = uniqueServers.includes(element[key]);

        if (!isDuplicate) {
            uniqueServers.push(element[key]);

            return true;
        }

        return false;
    });
}

const filterMultiServers = (serverMulti) => {
    
    const selectActiveServer=serverMulti.filter(item=>{
        if(item.status==='enable'){
            return item
        }
    });
   const removeSameMulti=removeDuplicate(selectActiveServer,'host');
    return removeSameMulti.map(item=>`${item.host}:${item.port}`)
}


const showMultiServerToPick =async (ctx,key) => {
    const multiServers=await getMultiRequest(ctx);
    if(multiServers && multiServers.length>0){
        const list=filterMultiServers(multiServers).map(item=>{
            return [
                {text: `${item}`, callback_data: `${key}-${item.split(':')[0]}`},
            ]
        });
        await ctx.reply('این عملیات روی کدام سرور انجام شود:',{
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'سرور اصلی', callback_data: `${key}-localhost`},
                    ],
                    ...list
                ]
            }
        })
    }else{
        await ctx.reply('این عملیات روی کدام سرور انجام شود:',{
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'سرور اصلی', callback_data: `${key}-localhost`},
                    ]
                ]
            }
        })
    }
}


module.exports={
    querySerialize,responseHandler,urlEncode,generateMenu,getMe,commandValidation,getUsersList,getOnlineUsersList,generateUser,deleteUser,unlockUser,lockUser,resetPassword,createAdmin,deleteAdminUser,changeMulti,getIPRequest,addMultiRequest,getMultiRequest,removeDuplicate,filterMultiServers,showMultiServerToPick,transactionNotification,renewUserRequest
}