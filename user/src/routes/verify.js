const express=require('express')
const {query, validationResult, matchedData} = require("express-validator");
const {shareData} = require("../utils/shareData");
const {getZarinToken, getAdminsServersList, responseHandler, filterPlan,generateUser, getPlanFromDB} = require("../utils/utils");
const transactionModel = require("../models/Transaction");
const f = require("node-fetch");
const router=express.Router()


router.post('/',query(['authority','status']).notEmpty(),async (req,res)=>{
    shareData.zarinpal_token=await getZarinToken();
    shareData.servers_list=await getAdminsServersList();
    shareData.plans=await getPlanFromDB();
    const result = await validationResult(req);
    if(result.isEmpty()) {
        const query = matchedData(req);
        const getTransaction=await transactionModel.findOne({transaction_id:query.authority,payment_status:'waiting payment'});
        if(getTransaction){
            /// payment successful
            if(query.status==='OK' ){
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
                        //// payment is verified
                        transactionModel.
                        findOneAndUpdate({transaction_id:query.authority},{payment_status:'success',card_num:verifyData.data.card_pan,ref_id:verifyData.data.ref_id}).
                        then(async ()=>{
                            //// create user
                            await generateUser(getTransaction.bot_id,getTransaction.plan_id,getTransaction.target_server)
                            //// finish verification
                            res.status(200).send(responseHandler(false,'✅ عملیات پرداخت با موفقیت انچام شد!',{
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
                        findOneAndUpdate({transaction_id:query.authority},{payment_status:'failed'}).
                        then(async ()=>{
                            res.status(200).send(responseHandler(false,'❌ این تراکنش از طرف زرین پال معتبر نیست!',{
                                ref_id:null,
                                transaction_id:query.authority,
                                order_id:getTransaction.order_id,
                                plan:filterPlan(getTransaction.plan_id)
                            }))
                        })
                    }
                })
            }else if(query.status==='NOK'){
                transactionModel.
                findOneAndUpdate({transaction_id:query.authority},{payment_status:'failed'}).
                then(async ()=>{
                    res.status(200).send(responseHandler(false,'❌ عملیات پرداخت ناموفق شد.',{
                        ref_id:null,
                        transaction_id:query.authority,
                        order_id:getTransaction.order_id,
                        plan:filterPlan(getTransaction.plan_id)
                    }))
                })
            }
        }else{
            res.status(200).send(responseHandler(true,'❌ این تراکنش وجود ندارد!',{
                ref_id:null,
                transaction_id:query.authority,
            }))
        }
    }else{
        res.status(200).send(responseHandler(true,' ❌ اشکال در پردازش تراکنش!',null))
    }
})









module.exports=router