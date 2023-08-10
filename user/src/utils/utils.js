require('dotenv').config()
const adminModel=require('../models/Admin')
const userModel=require('../models/User')
const f=require('node-fetch')
const {shareData} = require("./shareData");
const {resetAllStates} = require("./states");
const {resetAllAnswers} = require("./answers");
const planModel=require('../models/Plan')
const {bot} = require("../bot.config");

const problems = [
    {
        id:1,
        title:'عدم اتصال اکانت',
    },
    {
        id:2,
        title:'مشکل در تراکنش'
    }
]


const getPlanFromDB =async () => {
  const plans=await planModel.find({});
  return plans.map(item=>{
      return {
          id:item.plan_id,
          duration:item.duration,
          multi:item.multi,
          price:item.price
      }
  })
}


const invisibleServerIP=(str)=>{
    const src=['d','f','r','y','h','e','o','n','g','t'];
    const strSplit=str.split('.');
    return strSplit.map(item=>{
        return item.split('').map(sub=>{
            return src[Number(sub)]
        }).join('')
    }).join('.')
}

const queryValidation = async (callback,ctx,needReset,needValidation) => {
    if(needReset ){
        resetAllStates(ctx.chat.id);
        resetAllAnswers(ctx.chat.id);
    }
    shareData.servers_list=await getAdminsServersList();
    shareData.zarinpal_token=await getZarinToken();
    shareData.plans=await getPlanFromDB();
    if(needValidation){
        if(shareData.servers_list.length>0 && shareData.zarinpal_token.length>0 && shareData.plans.length>0){
            callback()
        }else{
            ctx.reply('❌ جهت خرید اکانت نیاز به درگاه پرداخت , سرور فعال و پلن می باشد.\n جهت رفع مشکل لطفا این را به ادمین ها اطلاع دهید.')
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



const generateCommands =async (ctx) => {
    await ctx.reply(`⚙️ منو کاربری:\nیک گزینه را انتخاب کنید.\n@${ctx.botInfo.username}`,{
      reply_markup:{
          inline_keyboard:[
              [{text:' 📱 خرید اکانت',callback_data:'buy_account'}],
              [{text:'📡 نمایش اکانت ها',callback_data:'show_account'}],
              [{text:'💶 نمایش تراکنش های مالی',callback_data:'show_transactions'}],
              [{text:'🎫 ارسال تیکت',callback_data:'send_ticket'}],
              [{text:'👀 مشاهده تیکت ها',callback_data:'show_ticket'}],
          ]
      }
  })
}

const getServerLocation = async (servers) => {
    const promises = await Promise.all(servers.map(server => f(`http://apiip.net/api/check?ip=${server}&accessKey=${process.env.IP_API_KEY}&fields=countryCode,countryName,ip`)));
    return await Promise.all(promises.map(p => p.json()))
}



const extractIps = (server) => {
    if(server.length>0){
        const edit2=server.map(item=>{
            if(item){
                return item.ip
            }
        });
        return edit2.flat();
    }else{
        return  [];
    }
}


const removeDuplicate = (arr) => {
    const uniqueServers = [];
    return  arr.filter(element => {
        const isDuplicate = uniqueServers.includes(element.ip);

        if (!isDuplicate) {
            uniqueServers.push(element.ip);

            return true;
        }

        return false;
    });
}



const getAdminsServersList = async () => {
    const adminsData=await adminModel.$where('this.server.ip');
    if(adminsData.length>0){
        const res=adminsData.map(p1=>{
            if(p1.multi.length>0){
                const embed=p1.multi.map(p2=>{
                    return{
                        multi:p2,
                        ip:p2.split(':')[0],
                        api:p1.server.ip,
                        token:p1.server.token,
                        ssh_port:p1.server.ssh_port,
                    }
                })
               return  [
                   ...embed,
                   {
                       ip:p1.server.ip.split(':')[0],
                       multi:'localhost',
                       api:p1.server.ip,
                       token:p1.server.token,
                       ssh_port:p1.server.ssh_port,
                   }
               ]
            }else{
                return {
                    ip:p1.server.ip.split(':')[0],
                    multi:'localhost',
                    api:p1.server.ip,
                    token:p1.server.token,
                    ssh_port:p1.server.ssh_port,
                }
            }
        })
        return  removeDuplicate(res.flat())
    }else{
        return []
    }
}
const getZarinToken =async () => {
    const hasToken=await adminModel.$where('this.zarinpal_token && this.zarinpal_token.length>0');
    if(hasToken.length>0){
        return hasToken[0].zarinpal_token
    }else{
        return ''
    }
}

const getOrderData =  (planId,ip) => {
  const data={
      plan:null,
      server:null
  };
  data.plan=shareData.plans.filter(item=>item.id==planId)[0];
  data.server=shareData.servers_list.filter(item=>item.ip.includes(ip))[0];
    return data
}


const getPlans = async (ctx) => {
    await ctx.reply('لطفا چند لحظه صبر کنید...');
    const plans=shareData.plans.map(item=>{
        return [{text:`👜 ${item.duration} ماه - ${item.multi} کاربر همزمان - حجم نامحدود - ${item.price} هزار تومان`,callback_data:`select_plan-${item.id}`}]
    })
    await ctx.reply('✅ در حال حاضر پلن های زیر موجود می باشد.\nجهت انتخاب روی یکی از گزینه های زیر کلیک نمایید:',{
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
    const server=process.env.PRODUCTION == 1 ? invisibleServerIP(process.env.SERVER_IP) : 'localhost';
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
          plan_id:shareData.plans[item.plan_id-1]
      }
  })
}

const extractPlan = (src) => {
  return {
      ...src,
      plan:shareData.plans[src.plan_id-1]
  }
}

const filterPlan = (id) => {
  return shareData.plans.filter(item=>item.id==id)[0]
}



const createPayLink = (ctx,authority,order_id) => {
    const url=process.env.REDIRECT_URL;
    const serverIP=process.env.PRODUCTION == 1 ? invisibleServerIP(process.env.SERVER_IP) : 'localhost';
    const port=process.env.PORT
    return [{text:`پرداخت`,url:url+`?authority=${authority}&server=${serverIP}&port=${port}&bot_name=${ctx.botInfo.username}&order_id=${order_id}`}]
}


const createOrder =async (ctx,duration,multi,price,order_id,authority,isActive) => {
    const orderMessage=isActive ? '✅ شما در حال حاضر یک سفارش فعال دارید.\n در صورت تمایل به تغییر سفارش, آنرا لغو و سپس دوباره اقدام به خرید نمایید.\n' : '✅ سفارش شما با موفقیت ایجاد شد!\n';
    await ctx.reply(orderMessage+`🎫 شماره سفارش: ${order_id}\n⚡️ اطلاعات اکانت: ${duration} ماه - ${multi} کاربر همزمان - ${price} هزار تومان\n🚨 در انتظار پرداخت\n⚠️جهت پرداخت بهتر است فیلترشکن خود را خاموش نمایید.\n⚠️درگاه پرداخت تا ۱۵ دقیقه دیگر فعال است. در صورت غیرفعال شدن درگاه پرداخت, سفارش فعلی را لغو و سفارش جدید ایجاد کنید. `,{
        reply_markup:{
            inline_keyboard:[
                createPayLink(ctx,authority,order_id),
                isActive ? [{text:'لغو سفارش',callback_data:`cancel_order-${authority}`}] : []
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
const getServerDataByIP = async (ip) => {
    shareData.servers_list=await getAdminsServersList();
   return shareData.servers_list.filter(item=>item.api===ip)[0];
}


const saveAccountToDB = async (bot_id,username,password,exdate,server,multi,ssh_port) => {
  const userData=await userModel.findOne({bot_id:bot_id});
  if(userData){
      await userModel.findOneAndUpdate({bot_id:bot_id},{
          accounts:[
          ...userData.accounts,
              {
                  username:username,
                  password:password,
                  exdate:exdate,
                  server,
                  multi,
                  ssh_port
              }
          ]
      })
  }

}

const sendAccountDataToTelegram = async (bot_id,username,password,multi,target_server,ssh_port,exdate) => {
    const account= `👨🏼‍💼 نام کاربری: ${username}\n🗝 رمز عبور: ${password}\n📱 کاربر همزمان: ${multi}\n💻آی پی آدرس: ${target_server.split(':')[0]}\n🌐پورت: ${ssh_port || 22}\n📅 فعال تا تاریخ: ${exdate}`;
    await bot.telegram.sendMessage(bot_id,'✅اکانت شما با موفقیت ساخته شد! \n\n'+account+'\n\n👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻\n آموزش اتصال اکانت ها در اندروید و  آیو اس:'+'\n @hyper_vpn_installation')
}

const generateUser =async (transaction) => {
    const {bot_id,plan_id,target_server,target_multi}=transaction;
    //////
    const serverData=await getServerDataByIP(target_server);
    const plan=filterPlan(plan_id);
    const duration=Number(plan.duration);
    const exdate=calculateExDate(duration)
    const multi=Number(plan.multi)
    const query=querySerialize({
        multi:multi,
        exdate:exdate,
        count:1,
        server:target_multi,
    });

    try {
        const request=await f(`http://${target_server}/user-gen?`+query,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverData.token}`
            },
        });
        const response=await request.json();
        if(response.success){
            const username=response.data[0].user;
            const password=response.data[0].passwd;
            await saveAccountToDB(bot_id,username,password,exdate,target_server,multi,serverData.ssh_port);
            await sendAccountDataToTelegram(bot_id,username,password,multi,target_server,serverData.ssh_port,exdate);
        }else{
            return false
        }
    }catch (err) {
        return false
    }
}


const sendTransactionStatus = async (transaction,ref_id,card_num,isSuccess) => {
    const statusMessage=isSuccess ? '✅ تراکنش شما با موفقیت انجام شد.\n'  :  '❌ متاسفانه تراکنش شما ناموفق بود.\n';
    const plan=filterPlan(transaction.plan_id);
  await bot.telegram.sendMessage(transaction.bot_id,statusMessage+`👜 شماره سفارش: ${transaction.order_id}\n🏆 اطلاعات اکانت: ${plan.duration} ماه - ${plan.multi} کاربر همزمان\n💴 مبلغ قابل پرداخت: ${plan.price} هزارتومان\n🔑 کد رهگیری زرین پال : ${ref_id || ''}\n❔ وضعیت سفارش: ${isSuccess ? 'موفق' : 'ناموفق'}\n💳 شماره کارت: ${card_num || ''}`)
}

module.exports={
    querySerialize,responseHandler,generateCommands,getServerLocation,extractIps,getPlans,getAdminsServersList,getZarinToken,getOrderData,requestAuthority,transformPlanId,extractPlan,createPayLink,createOrder,filterPlan,generateUser,queryValidation,invisibleServerIP,removeDuplicate,getPlanFromDB,problems,sendTransactionStatus
}