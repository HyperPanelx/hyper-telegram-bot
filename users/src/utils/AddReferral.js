const userModel=require('../models/User')
const adminModel=require('../models/Admin')
const {bot} = require("../bot.config");
const {adminData}=require('../utils/adminData')

const referral_token_state={
    state:false,
    token:''
}
const resetReferralTokenState = () => {
    referral_token_state.token=''
    referral_token_state.state=false
}

const saveReferralTokenInDB = async (userId,chatId,token) => {
    const saveToken=await userModel.
    findOneAndUpdate({bot_id:userId},{referral_token:token});
}



const addReferralTokenProcess = async (chatId,txt,userId) => {
    if(referral_token_state.state){
        referral_token_state.token=txt;
        adminModel.
        findOne({referral_token:referral_token_state.token}).
        then(async (data)=>{
            if(data){
                const {token,paypal_link,firstname,server}=data;
                if(paypal_link.length>0){
                    adminData.server=server
                    adminData.token=token
                    adminData.paypal_link=paypal_link
                    adminData.firstname=firstname
                    await saveReferralTokenInDB(userId,chatId,referral_token_state.token)
                    await bot.telegram.sendMessage(chatId,`✅ your referral token is valid!\n👨🏼‍💼referral person is ${firstname}\n enter /start to continue.`)
                }else{
                    await bot.telegram.sendMessage(chatId,'❌ sorry, the referral person does not have any paypal link.\n enter /start to try again.')
                }

            }else{
                await bot.telegram.sendMessage(chatId,'❌ your referral token is invalid! enter /start to try again. ')
            }
            resetReferralTokenState()
        })


    }
}




module.exports={
    referral_token_state,addReferralTokenProcess
}