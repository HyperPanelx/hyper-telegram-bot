const mongoose=require('mongoose')


const transactionSchema=mongoose.Schema({
    bot_id:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },
    pay_amount:{
        type:Number,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },
    order_id:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },
    transaction_id:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    plan_id:{
        type:String,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200,
    },
    target_server:{
        type:String,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200,
    },
    target_multi:{
        type:String,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200,
    },
    payment_status:{
        type:String,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200,
    },
    card_num:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    ref_id:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    created_at:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    updated_at:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    payment_mode:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    is_submitted:{
        type:Boolean,
        required:false,
    }

})




const transactionModel=mongoose.model('transaction',transactionSchema)


module.exports=transactionModel