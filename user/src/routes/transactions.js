const express=require('express')
const {query, validationResult, matchedData} = require("express-validator");
const {shareData} = require("../utils/shareData");
const {getZarinToken, getAdminsServersList, responseHandler,filterPlan, getPlanFromDB} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const router=express.Router()


router.post('/',query(['authority','order_id']).notEmpty(),async (req,res)=>{
    shareData.zarinpal_token=await getZarinToken();
    shareData.servers_list=await getAdminsServersList();
    shareData.plans=await getPlanFromDB();
    const result = await validationResult(req);
    if(result.isEmpty()) {
        const query = matchedData(req);
        const getTransaction=await transactionModel.findOne({transaction_id:query.authority,order_id:query.order_id,payment_status:'waiting payment'});
        if(getTransaction){
            res.status(200).send(responseHandler(false,null,{
                pay_amount:getTransaction.pay_amount,
                order_id:getTransaction.order_id,
                plan:filterPlan(getTransaction.plan_id),
                transaction_id:getTransaction.transaction_id
            }))
        }else{
            res.status(200).send(responseHandler(true,'❌ این تراکنش قبلا پردازش شده است!',null))
        }
    }else{
        res.status(200).send(responseHandler(true,'error',null))
    }
})











module.exports=router