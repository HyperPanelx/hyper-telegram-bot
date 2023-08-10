const {bot}=require('../bot.config');
const {generateMenu}=require('../utils/utils')


bot.action('show_menu',async (ctx)=>{
    await generateMenu(ctx)
})