require('dotenv').config()
const adminModel=require('../models/Admin')
const userModel=require('../models/User')
const {bot} = require("../bot.config");
const f=require('node-fetch')
const {shareData} = require("./shareData");
const {resetAllStates} = require("./states");
const {resetAllAnswers} = require("./answers");

const buy_plans=[
    {
        id:1,
        duration:1,
        multi:1,
        price:100
    },
    {
        id:2,
        duration:1,
        multi:2,
        price:150
    },
    {
        id:3,
        duration:1,
        multi:3,
        price:250
    },
    {
        id:4,
        duration:3,
        multi:1,
        price:250
    },
    {
        id:5,
        duration:3,
        multi:2,
        price:350
    },
    {
        id:6,
        duration:3,
        multi:3,
        price:550
    },

]
const invisibleServerIP=(str)=>{
    const src=['d','f','r','y','h','e','o','n','g','t'];
    const strSplit=str.split('.');
    return strSplit.map(item=>{
        return item.split('').map(sub=>{
            return src[Number(sub)]
        }).join('')
    }).join('.')
}

const queryValidation = async (callback,ctx) => {
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    if(ctx){
        if(shareData.servers_list.length>0 && shareData.zarinpal_token.length>0){
            callback()
        }else{
            resetAllStates(ctx.chat.id);
            resetAllAnswers(ctx.chat.id);
            ctx.reply('❌ There is not any active server or zarin pal token!\nContact Admins.')
        }
    }else{
        callback()
    }
}




const querySerialize = (obj) => {
  return Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&');
}

const responseHandler = (error,msg,data) => {
    return {
        error:error,
        msg:msg,
        data:data
    }
}



const generateCommands = (ctx) => {
    ctx.reply(`⚒ Our services:`,{
      reply_markup:{
          inline_keyboard:[
              [{text:'🥇 buy account',callback_data:'buy_account'}],
              [{text:'🥈 show accounts',callback_data:'show_account'}],
              [{text:'🥉 show transactions',callback_data:'show_transactions'}],
          ]
      }
  })
}

const getServerLocation = async (servers) => {
    const promises = await Promise.all(servers.map(server => f(`http://apiip.net/api/check?ip=${server}&accessKey=${process.env.IP_API_KEY}&fields=countryCode,countryName,ip`)));
    return await Promise.all(promises.map(p => p.json()))
}

const commandValidation = async (callback,chatId,userId) => {


}

const extractIps = (server) => {
    if(server.length>0){
        const edit2=server.map(item=>{
            if(item){
                return item.ip
            }
        });
        return edit2.flat().map(item=>{
            return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/.exec(item)[0]
        })
    }else{
        return  [];
    }
}




const getAdminsServersList = async () => {
    const adminData=await adminModel.$where('this.server.length>0');
    const isServerAvailable=adminData.filter(item=>item.server.length>0);
    const edit1=isServerAvailable.map(item=>{
        if(item.server.length>0){
            return item.server
        }
    });

    if(edit1.length>0){
        const edit2=edit1.map(item=>{
            if(item){
                return  item.map(server=>{
                    return {
                        ip:server.ip,
                        token:server.token
                    }
                })
            }
        });
        return edit2.flat()
    }else{
        return  [];
    }
}
const getZarinToken =async () => {
    const hasToken=await adminModel.$where('this.zarinpal_token.length>0');
    if(hasToken.length>0){
        return hasToken[0].zarinpal_token
    }else{
        return ''
    }
}

const getOrderData = (planId,ip) => {
  const data={
      plan:null,
      server:null
  };
  data.plan=buy_plans.filter(item=>item.id==planId)[0];
  data.server=shareData.servers_list.filter(item=>item.ip.includes(ip))[0];
    return data
}


const getPlans = (ctx) => {
    const plans=buy_plans.map(item=>{
        return [{text:`👜 ${item.duration} Month - ${item.multi} multi user - unlimited - ${item.price} T`,callback_data:`select_plan-${item.id}`}]
    })
    ctx.reply('✅ Our available plans.\n❔ Choose a plan:',{
        reply_markup:{
            inline_keyboard:[
                ...plans
            ]
        }
    })
}

const requestAuthority = async (amount,bot_name,order_id) => {
    const url=process.env.ZARIN_PAY_REQUEST;
    const call_back=process.env.CALLBACK_URL;
    const server=process.env.PRODUCTION == 1 ? 'localhost' : invisibleServerIP(process.env.SERVER_IP);
    const port=process.env.PORT;
  try {
      const req=await f(url,{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
              merchant_id:shareData.zarinpal_token,
              amount:Number(amount+'0000'),
              callback_url:call_back+`?server=${server}&port=${port}&bot_name=${bot_name}`,
              description:`order id: ${order_id}`
          })
      })
      const res=await req.json()
      if(res.data && res.data.message==='Success' && res.data.authority){
          return  res.data.authority
      }else{
          return false;
      }
  }catch (err) {
      return  false;
  }
    
}

const transformPlanId = (source) => {
  return source.map(item=>{
      return {
          ...item,
          plan_id:buy_plans[item.plan_id-1]
      }
  })
}

const extractPlan = (src) => {
  return {
      ...src,
      plan:buy_plans[src.plan_id-1]
  }
}

const filterPlan = (id) => {
  return buy_plans.filter(item=>item.id==id)[0]
}

const showTransactionResult = async (ctx,data) => {
    const statusMessage=data?._doc?.payment_status==='success' ? '✅ Transaction was successful!\n'  :  '❌ Transaction failed!\n';
    const accountMessage=data?._doc?.payment_status==='success'? 'select show accounts to get your account!' : '';
    await ctx.reply(statusMessage+`👜 Order id: ${data?._doc.order_id}\n🏆 Plan: ${data.plan.duration} Month - ${data.plan.multi} Multi user\n💴 Pay amount: ${data.plan.price} T\n🎖 Ref id : ${data?._doc.ref_id || ''}\n❔ Payment status: ${data?._doc?.payment_status}\n💳 Card number: ${data?._doc?.card_num || ''}`+`
     ${accountMessage}`)
}

const createPayLink = (ctx,authority,order_id) => {
    const url=process.env.REDIRECT_URL;
    const serverIP=process.env.PRODUCTION == 1 ? 'localhost' : invisibleServerIP(process.env.SERVER_IP);
    const port=process.env.PORT
    return [{text:`pay`,url:url+`?authority=${authority}&server=${serverIP}&port=${port}&bot_name=${ctx.botInfo.username}&order_id=${order_id}`}]
}


const createOrder =async (ctx,duration,multi,price,order_id,authority,isActive) => {
    const orderMessage=isActive ? '🗿 You have got one active order!\n' : '🗿 Order created successfully!\n';
    await ctx.reply(orderMessage+`🚨 order id:${order_id}\n🚨 plan: ${duration} month - ${multi} multi user - ${price} T\n🚨 waiting for payment.\n⚠️Turn off you VPN and then enter the website.`,{
        reply_markup:{
            inline_keyboard:[
                createPayLink(ctx,authority,order_id),
                isActive ? [{text:'cancel order',callback_data:`cancel_order-${authority}`}] : []
            ]
        }
    })
}

const calculateExDate = (addMonth) => {
    //// calculate date
    const date=new Date();
    const currentMonth=date.getMonth()+1
    const newDate=date.setMonth(currentMonth+addMonth)
    ///
    const year=date.getFullYear()
    const day=date.getUTCDate()
    const newMonth=new Date(newDate).getMonth();
    return `${year}-${newMonth}-${day}`
}
const getTokenByIP = async (ip) => {
    shareData.servers_list=await getAdminsServersList();
   return shareData.servers_list.filter(item=>item.ip===ip)[0].token;
}

const saveAccountToDB = async (bot_id,username,password,exdate,server) => {
  const userData=await userModel.findOne({bot_id:bot_id});
  if(userData){
      await userModel.findOneAndUpdate({bot_id:bot_id},{accounts:[
          ...userData.accounts,
              {
                  username:username,
                  password:password,
                  exdate:exdate,
                  server
              }
          ]
      })
  }

}

const generateUser =async (bot_id,plan_id,server) => {
    const token=await getTokenByIP(server)
    const plan=filterPlan(plan_id);
    const duration=Number(plan.duration);
    const exdate=calculateExDate(duration)
    const query=querySerialize({
        multi:Number(plan.multi),
        exdate:exdate,
        count:1,
        server:'localhost',
    });

    try {
        const request=await f(`http://${server}/user-gen?`+query,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`
            },
        })
        const response=await request.json();
        if(response.success){
            await saveAccountToDB(bot_id,response.data[0].user,response.data[0].passwd,exdate,server)
        }else{
            return false
        }
    }catch (err) {
        return false
    }
}

module.exports={
    querySerialize,responseHandler,generateCommands,commandValidation,buy_plans,getServerLocation,extractIps,getPlans,getAdminsServersList,getZarinToken,getOrderData,requestAuthority,transformPlanId,extractPlan,showTransactionResult,createPayLink,createOrder,filterPlan,generateUser,queryValidation,invisibleServerIP
}