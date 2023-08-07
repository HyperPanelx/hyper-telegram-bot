const mongoose=require('mongoose')


const ticketSchema=mongoose.Schema({
    bot_id:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },ticket_id:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },
    order_id:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    username:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:200,
    },
    title:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:200,
    },
    message:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:1000,
    },
    answer:{
        type:String,
        required:false,
        trim:true,
        minLength:0,
        maxLength:1000,
    },
    isActive:{
        type:Boolean,
        required:true,
        trim:true,
        minLength:0,
        maxLength:1000,
    }

})




const ticketModel=mongoose.model('ticket',ticketSchema)


module.exports=ticketModel