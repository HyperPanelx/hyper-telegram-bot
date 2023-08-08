import 'bootstrap/dist/css/bootstrap.min.css'
//////////////////
const container=document.querySelector('#container');
const wait=document.querySelector('#wait');
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


const generatePaymentData = (order_id,duration,multi,price,authority,server,port,bot_name) => {
  const el=` <div class="row justify-content-center ">
            <div class="col col-md-5 col-12 ">
                <div class="card p-3">
                    <h5 class="text-center">اطلاعات سفارش شما</h5>
                    <div class="mt-2 d-flex flex-md-row flex-column justify-content-md-between align-items-center">
                        <p>شمار سفارش:</p>
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
                    <div class="mt-2 ">
                        <p class="text-center">اخطار: قبل از وارد شدن به درگاه پرداخت از خاموش بودن فیلترشکن یا پراکسی دستگاه خود مطمين شوید.</p>
                    </div>
                    <div  class="mt-2 text-center">
                        <button data-transaction="${authority}"  id="payment" class="btn btn-primary">
                            پرداخت
                        </button>
                        <button data-transaction="${authority}" 
                                data-order="${order_id}"
                                data-server="${server}"
                                data-port="${port}"
                                data-bot="${bot_name}"
                                
                         id="cancel" class="btn btn-danger mx-1">
                            لغو پرداخت
                        </button>
                    </div>

                </div>
            </div>
        </div>`;
    wait.style.display='none'
    container.insertAdjacentHTML('beforeend',el);
    document.querySelector('#payment').addEventListener('click',redirectToPay);
    document.querySelector('#cancel').addEventListener('click',cancelPayment);
}


const generateError = (msg,bot_name,authority) => {
    const el=` <div class="row justify-content-center ">
            <div class="col col-md-5 col-12 ">
                <div class="card p-3">
                    <h5 class="text-center mb-2">${msg}</h5>
                       <div  class="mt-1 text-center">
                        <button data-transaction="${authority}" data-bot="${bot_name}"  id="back-to-bot" class="btn btn-primary">
                             بازگشت به ربات تلگرام
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    wait.style.display='none'
    container.insertAdjacentHTML('beforeend',el);
    document.querySelector('#back-to-bot').addEventListener('click',backToBot);
}

const redirectToPay = (ev) => {
  const authority=ev.target.dataset.transaction;
    if(authority){
        window.location='https://www.zarinpal.com/pg/StartPay/'+authority
    }
}

const backToBot = (ev) => {
  const {bot}=ev.target.dataset;
    window.location='https://t.me/'+bot+"?start=done"
}

const cancelPayment = (ev) => {
    const {transaction, order, server, port, bot}=ev.target.dataset
    fetch(`http://${server}:${port}/cancel?authority=${transaction}&order_id=${order}`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        }
    }).then(response=>response.json()).then(response=>{
        window.location='https://t.me/'+bot+"?start=done"
    }).catch(()=>{
        window.location='https://t.me/'+bot+"?start=done"
    })
}


const getInitialData = () => {
    const{authority,server,port,bot_name,order_id}=params;
    if(authority && server && port && bot_name && order_id){
        const ip=server==='localhost' ? 'localhost' :visibleServer(server);
        fetch(`http://${ip}:${port}/transactions?authority=${authority}&order_id=${order_id}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(response=>response.json()).then(response=>{
            if(response.error){
                generateError(response.msg,bot_name,authority)
            }else{
                const {order_id,plan:{duration,multi,price},transaction_id}=response.data;
                generatePaymentData(order_id,duration,multi,price,transaction_id,ip,port,bot_name);
            }
        }).catch(err=>{
            window.location='https://t.me/'+bot_name+"?start=done"
        })
    }else{
        window.location='https://t.me/'+bot_name+"?start=done"
    }
}



window.addEventListener('load',getInitialData)
