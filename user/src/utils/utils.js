require('dotenv').config()
const adminModel=require('../models/Admin')
const userModel=require('../models/User')
const {bot} = require("../bot.config");
const f=require('node-fetch')
const {shareData} = require("./shareData");

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
    const hasToken=await adminModel.$where('this.zarinpal_token.length>0')
    return hasToken[0].zarinpal_token
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
    const server=process.env.SERVER_IP;
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


module.exports={
    querySerialize,responseHandler,generateCommands,commandValidation,buy_plans,getServerLocation,extractIps,getPlans,getAdminsServersList,getZarinToken,getOrderData,requestAuthority,transformPlanId,extractPlan
}