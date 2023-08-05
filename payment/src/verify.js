import 'bootstrap/dist/css/bootstrap.min.css'

const container=document.querySelector('#container')
const wait=document.querySelector('#loader');
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const visibleServer=(str)=>{
    const src=[0,1,2,3,4,5,6,7,8,9];
    const alp=['d','f','r','y','h','e','o','n','g','t'];
    const strSplit=str.split('.');
    return strSplit.map(item=>{
        return item.split('').map(sub=>{
            return src[alp.indexOf(sub)]
        }).join('')
    }).join('.')
}
const generateTransactionData = (msg,ref_id,transaction_id,order_id,{duration,multi,price},bot_name) => {
    const el=`<div class="row justify-content-center ">
            <div class="col col-md-5 col-12 ">
                <div class="card p-3">
                    <h5 class="text-center mb-2">${msg}</h5>
                    <div class="mt-2 d-flex flex-md-row flex-column justify-content-md-between align-items-center">
                        <p>شمار رهگیری:</p>
                        <p>${ref_id ? ref_id : 'عدم دریافت کد رهگیری زرین پال'}</p>
                    </div>
                    <div class="mt-2 d-flex flex-md-row flex-column justify-content-md-between align-items-center">
                        <p>شماره سفارش:</p>
                        <p>${order_id}</p>
                    </div>
                    <div class="mt-2 d-flex flex-md-row flex-column justify-content-md-between align-items-center">

                        <p>اطلاعات اکانت:</p>
                        <p>
                            <span>${duration}</span>
                            <span>ماه</span>
                            <span>-</span>
                            <span>${multi}</span>
                            <span>کاربره</span>
                            <span>-</span>
                            <span>مبلغ قابل پرداخت:</span>
                            <span>${price} هزار تومان</span>
                        </p>
                    </div>
                    <div class="mt-2 text-center">
                        <button data-transaction="${transaction_id}" data-bot="${bot_name}" id="back-bot" class="btn btn-primary">
                            بازگشت به ربات تلگرام
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    wait.style.display='none'
    container.insertAdjacentHTML('beforeend',el);
    document.querySelector('#back-bot').addEventListener('click',finishTransaction)

}

const generateError = (msg,transaction_id,bot_name) => {
    const el=`<div class="row justify-content-center ">
            <div class="col col-md-5 col-12 ">
                <div class="card p-3">
                    <h5 class="text-center mb-2">${msg}</h5>
                    <div class="mt-2 text-center">
                        <button id="back-bot" data-transaction="${transaction_id}" data-bot="${bot_name}" class="btn btn-primary">
                            بازگشت به ربات تلگرام
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    wait.style.display='none'
    container.insertAdjacentHTML('beforeend',el);
    document.querySelector('#back-bot').addEventListener('click',finishTransaction)
}
const finishTransaction = (ev) => {
  const {transaction,bot}=ev.target.dataset;
  window.location='https://t.me/'+bot+`?start=${transaction}`
}

const submit_payment = () => {
    const {server,port,Authority,Status,bot_name}=params;
    if(server && port && Authority && Status && bot_name){
        const ip=server==='localhost' ? 'localhost' :visibleServer(server);
        fetch(`http://${ip}:${port}/verify?authority=${Authority}&status=${Status}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res=>res.json()).then(response=>{
            const {ref_id,transaction_id,order_id,plan}=response.data;
            if(response.error){
                generateError(response.msg,transaction_id,bot_name)
            }else{
                generateTransactionData(response.msg,ref_id,transaction_id,order_id,plan,bot_name)
            }
        }).catch(err=>{
            window.location='https://t.me/'+bot_name+`?start=${Authority}`
        })
    }else{
        window.location='https://t.me/'+bot_name+`?start=failed`
    }

}



window.addEventListener('load',submit_payment)
