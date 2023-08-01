const mongoose=require('mongoose')


const adminSchema=mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200
    },
    bot_id:{
        type:String,
        required:true,
        trim:true,
        minLength:3,
        maxLength:200
    },
    server:{
        type:Array,
        required:false,
    },
    referral_token:{
        type:String,
        required:false,
        minLength:0,
        maxLength:200
    },
    paypal_link:{
        type:String,
        required:false,
        minLength:0,
        maxLength:200
    }

})




const adminModel=mongoose.model('admin',adminSchema)


module.exports=adminModel