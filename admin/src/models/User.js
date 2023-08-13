const mongoose=require('mongoose')


const userSchema=mongoose.Schema({
    tel_username:{
        type:String,
        required:false,
        minLength:0,
        maxLength:100,
        trim:true
    },
    bot_id:{
        type:String,
        required:true,
        minLength:2,
        maxLength:100,
        trim:true
    },
    accounts:{
        type:Array,
        required:false,
        minLength:0,
        maxLength:100,
        trim:true
    }
})




const userModel=mongoose.model('user',userSchema)



module.exports=userModel

