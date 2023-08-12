const express=require('express')
const {query, validationResult, matchedData} = require("express-validator");
const {shareData} = require("../utils/shareData");
const {getZarinToken, getAdminsServersList, responseHandler, filterPlan,generateUser, getPlanFromDB,sendTransactionStatus} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const f = require("node-fetch");
const router=express.Router()


router.post('/',query(['authority','status']).notEmpty(),async (req,res)=>{
    shareData.zarinpal_token=await getZarinToken();
    shareData.servers_list=await getAdminsServersList();
    shareData.plans=await getPlanFromDB();
    const date=new Date();
    const result = await validationResult(req);
    if(result.isEmpty()) {
        const query = matchedData(req);
        const getTransaction=await transactionModel.findOne({transaction_id:query.authority,payment_status:'waiting payment',payment_mode:'paypal'});
        if(getTransaction){
            /// payment successful
            f(process.env.ZARIN_PAY_VERIFY,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    merchant_id:shareData.zarinpal_token,
                    amount:Number(getTransaction.pay_amount+'0000'),
                    authority:query.authority
                })
            }).then(verifyData=>verifyData.json()).then(async verifyData=>{
                if(verifyData.errors.length===0 && verifyData.data.card_pan &&  verifyData.data.ref_id && verifyData.data.code===100){
                    //// payment is verified
                    transactionModel.
                    findOneAndUpdate({transaction_id:query.authority},{payment_status:'success',card_num:verifyData.data.card_pan,ref_id:verifyData.data.ref_id,updated_at:date.toLocaleString()}).
                    then(async ()=>{
                        //// send transaction data to telegram chat
                        await sendTransactionStatus(getTransaction,verifyData.data.ref_id,verifyData.data.card_pan,true)
                        //// create user
                        await generateUser(getTransaction);
                        //// finish verification
                        res.status(200).send(responseHandler(false,'✅ عملیات پرداخت با موفقیت انجام شد!',{
                            ref_id:verifyData.data.ref_id,
                            transaction_id:query.authority,
                            order_id:getTransaction.order_id,
                            plan:filterPlan(getTransaction.plan_id)
                        }))
                    })
                }
                else{
                    ////verification is not verified
                    transactionModel.
                    findOneAndUpdate({transaction_id:query.authority},{payment_status:'failed',updated_at:date.toLocaleString()}).
                    then(async ()=>{
                        //// send transaction data to telegram chat
                        await sendTransactionStatus(getTransaction,null,null,false)
                        //////
                        res.status(200).send(responseHandler(false,'❌ عملیات پرداخت ناموفق شد.',{
                            ref_id:null,
                            transaction_id:query.authority,
                            order_id:getTransaction.order_id,
                            plan:filterPlan(getTransaction.plan_id)
                        }))
                    })
                }
            })
        }else{
            res.status(200).send(responseHandler(true,'❌ این تراکنش قبلا پردازش شده است.',{
                ref_id:null,
                transaction_id:query.authority,
            }))
        }
    }else{
        res.status(200).send(responseHandler(true,' ❌ اشکال در پردازش تراکنش!',null))
    }
})









module.exports=router