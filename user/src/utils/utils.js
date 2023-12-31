require('dotenv').config()
const adminModel=require('../models/Admin')
const userModel=require('../models/User')
const f=require('node-fetch')
const {shareData} = require("./shareData");
const {resetAllStates} = require("./states");
const {resetAllAnswers} = require("./answers");
const planModel=require('../models/Plan')
const transactionModel=require('../models/Transaction')
const {bot} = require("../bot.config");
const {nanoid} = require("nanoid");

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
          id:item._id,
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
    shareData.card_info=await getCardInfo();
    if(needValidation){
        if(shareData.servers_list.length>0 && shareData.zarinpal_token.length>0 && shareData.plans.length>0 && shareData.card_info && shareData.card_info.number.length>0 && shareData.card_info.name.length>0 ){
            callback()
        }else{
            ctx.reply('❌ متاسفانه اطلاعات کافی جهت پردازش خرید های این ربات از طرف ادمین ها تنظیم نشده است.\n جهت رفع مشکل لطفا این را به ادمین ها اطلاع دهید.')
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
              [
                  {text:' 📱 خرید اکانت',callback_data:'buy_account'},
                  {text:'📡 نمایش اکانت ها',callback_data:'show_account'}
              ],
              [
                  {text:'💶 نمایش تراکنش های مالی',callback_data:'show_transactions'},
                  {text:'🎫 ارسال تیکت',callback_data:'send_ticket'}
              ],
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

const getCardInfo =async () => {
    const hasCardInfo=await adminModel.$where('this.card_info && this.card_info.number.length>0 && this.card_info.name.length>0');
    if(hasCardInfo.length>0){
        return {
            number:hasCardInfo[0].card_info.number,
            name:hasCardInfo[0].card_info.name
        }
    }else{
        return {
            number:'',
            name:''
        }
    }
}

const getOrderData =  (planId,ip,method) => {
  const data={
      plan:null,
      server:null,
      method:null
  };
  data.method=method===1 ? 'paypal' : 'card_to_card';
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
          plan_id:shareData.plans.filter(p1=>p1.id==item.plan_id)[0]
      }
  })
}

const extractPlan = (src) => {
  return {
      ...src,
      plan:shareData.plans.filter(item=>item.id==src.plan_id)[0]
  }
}

const filterPlan = (id) => {
  return shareData.plans.filter(item=>item.id==id)[0]
}



const createPayLink = (ctx,authority,order_id) => {
    const url=process.env.REDIRECT_URL;
    const serverIP=process.env.PRODUCTION == 1 ? invisibleServerIP(process.env.SERVER_IP) : 'localhost';
    const port=process.env.PORT
    return [{text:`پرداخت از طریق درگاه زرین پال`,url:url+`?authority=${authority}&server=${serverIP}&port=${port}&bot_name=${ctx.botInfo.username}&order_id=${order_id}`}]
}


const createPaypalOrder =async (ctx,duration,multi,price,order_id,authority,isActive) => {
    const orderMessage=isActive ? '✅ شما در حال حاضر یک سفارش فعال دارید.\n در صورت تمایل به تغییر سفارش, آنرا لغو و سپس دوباره اقدام به خرید نمایید.\n' : '✅ سفارش شما با موفقیت ایجاد شد!\n';
    await ctx.reply(orderMessage+`🎫 شماره سفارش: ${order_id}\n⚡️ اطلاعات اکانت: ${duration} ماه - ${multi} کاربر همزمان - ${price} هزار تومان\n🚨 در انتظار پرداخت\n⚠️جهت پرداخت بهتر است فیلترشکن خود را خاموش نمایید.\n⚠️درگاه پرداخت تا ۱۵ دقیقه دیگر فعال است. در صورت غیرفعال شدن درگاه پرداخت, سفارش فعلی را لغو و سفارش جدید ایجاد کنید. `,{
        reply_markup:{
            inline_keyboard:[
                createPayLink(ctx,authority,order_id),
                isActive ? [{text:'لغو سفارش',callback_data:`cancel_order:${authority}`}] : []
            ]
        }
    })
}

const createCardToCardOrder = async (ctx,duration,multi,price,order_id,isActive) => {
    const orderMessage=isActive ? '✅ شما در حال حاضر یک سفارش فعال دارید.\n در صورت تمایل به تغییر سفارش, آنرا لغو و سپس دوباره اقدام به خرید نمایید.\n' : '✅ سفارش شما با موفقیت ایجاد شد!\n';
    await ctx.reply(orderMessage+`🎫 شماره سفارش: ${order_id}\n⚡️ اطلاعات اکانت: ${duration} ماه - ${multi} کاربر همزمان - ${price} هزار تومان\n💳 شماره کارت جهت پرداخت: ${shareData.card_info.number} - ${shareData.card_info.name}\n⚠️ بعد از پرداخت, اطلاعات کارت جهت بررسی را, با زدن گزینه ارسال اطلاعات کارت پرداخت کننده ثبت نمایید.\n⚠️ بررسی پرداخت ها ممکن است تا ۲۴ ساعت زمان ببرد.`,{
        reply_markup:{
            inline_keyboard:[
                 [{text:'بررسی پرداخت',callback_data:`check_transaction:${order_id}`}],
                 [{text:'ارسال اطلاعات کارت پرداخت کننده',callback_data:`send_card:${order_id}`}],
                 [{text:'لغو سفارش',callback_data:`cancel_order:${order_id}`}]
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


const saveAccountToDB = async (bot_id,username,password,exdate,server,multi,ssh_port,target_multi) => {
  const userData=await userModel.findOne({bot_id:bot_id});
  if(userData){
      await userModel.findOneAndUpdate({bot_id:bot_id},{
          accounts:[
          ...userData.accounts,
              {
                  username:username,
                  password:password,
                  exdate:exdate,
                  target_multi,
                  server,
                  multi,
                  ssh_port
              }
          ]
      })
  }

}

const sendAccountDataToTelegram = async (bot_id,username,password,multi,target_server,ssh_port,exdate,target_multi) => {
    if(target_multi==='localhost'){
        const account= `👨🏼‍💼 نام کاربری:\n ${username}\n🗝 رمز عبور:\n ${password}\n📱 کاربر همزمان: ${multi}\n💻آی پی آدرس: ${target_server.split(':')[0]}\n🌐پورت: ${ssh_port || 22}\n📅 فعال تا تاریخ: ${exdate}`;
        await bot.telegram.sendMessage(bot_id,'✅اکانت شما با موفقیت ساخته شد! \n\n'+account+'\n\n👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻\n آموزش اتصال اکانت ها در اندروید و  آیو اس:'+'\n @hyper_vpn_installation')
    }else{
        const account= `👨🏼‍💼 نام کاربری:\n ${username}\n🗝 رمز عبور:\n ${password}\n📱 کاربر همزمان: ${multi}\n💻آی پی آدرس: ${target_multi.split(':')[0]}\n🌐پورت: ${target_multi.split(':')[1]}\n📅 فعال تا تاریخ: ${exdate}`;
        await bot.telegram.sendMessage(bot_id,'✅اکانت شما با موفقیت ساخته شد! \n\n'+account+'\n\n👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻👇🏻\n آموزش اتصال اکانت ها در اندروید و  آیو اس:'+'\n @hyper_vpn_installation')
    }

}

const generateUser =async (transaction) => {
    const {bot_id,plan_id,target_server,target_multi}=transaction;
    const userData=await userModel.findOne({bot_id});
    const uniqueID=nanoid(7)
    //////
    const serverData=await getServerDataByIP(target_server);
    const plan=filterPlan(plan_id);
    const duration=Number(plan.duration);
    const exdate=calculateExDate(duration)
    const multi=Number(plan.multi)
    const query=querySerialize({
        username:bot_id+'@'+uniqueID,
        multi:multi,
        exdate:exdate,
        telegram_id:bot_id+userData.tel_username,
        phone:'09999999999',
        server:target_multi==='localhost' ? 'localhost' : target_multi.split(':')[0],
    });

    try {
        const request=await f(`http://${target_server}/user-add?`+query,{
            headers:{
                'Content-Type':'application/json',
                Authorization:`Bearer ${serverData.token}`
            },
        });
        const response=await request.json();
        if(response.success){
            const username=response.data.username;
            const password=response.data.password;
            await saveAccountToDB(bot_id,username,password,exdate,target_server,multi,serverData.ssh_port,target_multi);
            await sendAccountDataToTelegram(bot_id,username,password,multi,target_server,serverData.ssh_port,exdate,target_multi);
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
    querySerialize,responseHandler,generateCommands,getServerLocation,extractIps,getPlans,getAdminsServersList,getZarinToken,getOrderData,requestAuthority,transformPlanId,extractPlan,createPayLink,filterPlan,generateUser,queryValidation,invisibleServerIP,removeDuplicate,getPlanFromDB,problems,sendTransactionStatus,createPaypalOrder,createCardToCardOrder,getCardInfo
}