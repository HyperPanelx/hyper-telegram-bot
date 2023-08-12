const mongoose=require('mongoose');


const planSchema=mongoose.Schema({
    duration:{
        type:Number,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200
    },
    multi:{
        type:Number,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200
    },
    price:{
        type:Number,
        required:true,
        trim:true,
        minLength:1,
        maxLength:200
    }
})




const planModel=mongoose.model('plan',planSchema)


module.exports=planModel