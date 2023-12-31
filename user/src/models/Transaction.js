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
    card_name:{
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
    /// 0 waiting
    /// 1 ok
    /// 2 nok
    submit_stage:{
        type:Number,
        required:false,
    }

})




const transactionModel=mongoose.model('transaction',transactionSchema)


module.exports=transactionModel