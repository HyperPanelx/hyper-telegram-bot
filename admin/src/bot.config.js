const { Telegraf } = require('telegraf');
/// initial bot
const bot=new Telegraf(process.env.BOT_TOKEN)


const init = async () => {
    console.log('bot connected.')
    await bot.launch()
}


module.exports={
    bot,init
}