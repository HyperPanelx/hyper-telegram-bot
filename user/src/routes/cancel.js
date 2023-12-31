const express=require('express')
const {query, validationResult, matchedData} = require("express-validator");
const {shareData} = require("../utils/shareData");
const {getZarinToken, getAdminsServersList, responseHandler, getPlanFromDB,sendTransactionStatus} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const router=express.Router()


router.post('/',query(['authority','order_id']).notEmpty(),async (req,res)=>{
    shareData.zarinpal_token=await getZarinToken();
    shareData.servers_list=await getAdminsServersList();
    shareData.plans=await getPlanFromDB();
    const date=new Date();
    const result = await validationResult(req);
    if(result.isEmpty()) {
        const query = matchedData(req);
        transactionModel.
        findOneAndUpdate({order_id:query.order_id,transaction_id:query.authority,payment_status:'waiting payment'},{payment_status:'failed',updated_at:date.toLocaleString(),}).
        then(async (response)=>{
            // //// send transaction data to telegram chat
            await sendTransactionStatus(response,null,null,false)
            /////
            res.status(200).send(responseHandler(false,null,null))
        }).catch(()=>{
            res.status(200).send(responseHandler(true,'error',null))
        })
    }else{
        res.status(200).send(responseHandler(true,'error',null))
    }
})









module.exports=router