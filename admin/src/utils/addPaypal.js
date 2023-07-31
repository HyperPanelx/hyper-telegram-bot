const adminModel=require('../models/Admin')
const {bot}=require('../bot.config')
const {generateCommands} = require("./utils");

const addPaypalData={
    state:false,
    link:''
}
const resetAddPaypal = () => {
    addPaypalData.state=false
    addPaypalData.username=''
}


const addPaypalProcess = async (chatId,txt,userId) => {
  if(addPaypalData.state){
      addPaypalData.link=txt
        adminModel.
        findOneAndUpdate({bot_id:userId},{paypal_link:addPaypalData.link}).
        then(async ()=>{
            await bot.telegram.sendMessage(chatId,`✅ link added successfully!`)
            await generateCommands(chatId,userId)
            resetAddPaypal()
        }).catch(async ()=>{
            await bot.telegram.sendMessage(chatId,'❌ operation failed! enter /start to try again!')
        })
  }
}

module.exports= {
    addPaypalProcess,addPaypalData
}