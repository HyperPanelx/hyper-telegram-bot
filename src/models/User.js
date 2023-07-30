const mongoose=require('mongoose')


const usersSchema=mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true,
        minLength:3,
        maxLength:200
    },
    token:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
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
        type:String,
        required:false,
        minLength:0,
        maxLength:200
    },
    referral_token:{
        type:String,
        required:false,
        minLength:0,
        maxLength:200
    }

})




const userModel=mongoose.model('User',usersSchema)


module.exports=userModel