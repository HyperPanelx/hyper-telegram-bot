const express=require('express')
const {query, validationResult, matchedData} = require("express-validator");
const {shareData} = require("../utils/shareData");
const {getZarinToken, getAdminsServersList, responseHandler} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const f = require("node-fetch");
const router=express.Router()


router.post('/',query(['authority','status']).notEmpty(),async (req,res)=>{
    shareData.zarinpal_token=await getZarinToken();
    shareData.servers_list=await getAdminsServersList();
    const result = await validationResult(req);
    if(result.isEmpty()) {
        const query = matchedData(req);
        const getTransaction=await transactionModel.findOne({transaction_id:query.authority});

        if(query.status==='OK' ){
            if(getTransaction){
                f(process.env.ZARIN_PAY_VERIFY,{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        merchant_id:shareData.zarinpal_token,
                        amount:Number(getTransaction.pay_amount),
                        authority:query.authority
                    })
                }).then(verifyData=>verifyData.json()).then(verifyData=>{
                    if(verifyData.data.message==='Verified' && verifyData.errors.length===0 && verifyData.data.ref_id){
                        transactionModel.
                        findOneAndUpdate({transaction_id:query.authority},{payment_status:'success',card_num:verifyData.data.card_pan,ref_id:verifyData.data.ref_id}).
                        then(()=>{
                            res.status(200).send(responseHandler(false,null,null))
                        })
                    }else{
                        transactionModel.
                        findOneAndUpdate({transaction_id:query.authority},{payment_status:'failed'}).
                        then(()=>{
                            res.status(200).send(responseHandler(false,null,null))
                        })
                    }
                })
            }else{
                res.status(200).send(responseHandler(true,null,null))
            }

        }else if(query.status==='NOK'){
            transactionModel.
            findOneAndUpdate({transaction_id:query.authority},{payment_status:'failed'}).
            then(()=>{
                res.status(200).send(responseHandler(false,null,null))
            })
        }
    }else{
        res.status(200).send(responseHandler(true,'error',null))
    }
})









module.exports=router