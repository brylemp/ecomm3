var timeoutId;

async function updateCart(cartId,productId,quantity){
    console.log('updating')
    const response = await axios({
        method: 'put',
        url: `/cart/update/${cartId}/${productId}`,
        data:{
            quantity:parseInt(quantity)
        }
    })
    console.log(response)
}

function changeTotal(){
    const totalDiv = document.getElementById('summaryCheckout')
    const total = document.getElementById('total')
    // const oldTotal = total.innerHTML.replace(/\,/g,'').split('₱')[1]
    let newTotal = 0
    for(let i=0; i<totalDiv.children.length-2; i++){
        let tempPrice = totalDiv.children[i].children[1].innerText.split('= ')[1].replace(/\,/g,'').split('₱')[1]
        newTotal = newTotal + parseInt(tempPrice)
    }
    total.innerHTML = `₱${(newTotal+100).toLocaleString()}`
}

function changeQuantity(e){
    if(e.target.value < 0){
        e.target.value = 0;
    }
    const item = document.getElementById(e.target.dataset.title)
    item.innerHTML = `
        ₱${parseInt(e.target.dataset.price).toLocaleString() } x ${e.target.value} = ₱${(e.target.dataset.price * e.target.value).toLocaleString()}
    `
    changeTotal()

    if(timeoutId){
        clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(()=>{
        updateCart(e.target.dataset.cartid,e.target.dataset.productid,e.target.value)
    },3000)
}


const cartDiv = document.querySelector('#cartItems')
for(let child of cartDiv.children){
    child.children[0].children[1].children[0].children[1].addEventListener('change',changeQuantity)
}
// cartItems.children[0].children[0].children[1].children[0].children[1]