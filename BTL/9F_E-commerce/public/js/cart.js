const price = document.getElementsByClassName("price");
const len = price.length;
const total = document.getElementsByClassName("total-product-price");
const qty = document.getElementsByClassName("qty");
const total_all = document.getElementsByClassName("count-price");
var total_count = 0;


for (let i = 0; i < len; i++){
    let total_ammount = parseInt(price[i].innerHTML) * qty[i].value;
    total[i].innerHTML = total_ammount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    total_count += total_ammount;
}
total_all[0].innerHTML = total_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

for (let i = 0; i < len; i++){
    price[i].innerHTML = price[i].innerHTML.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function calculateProduct() {
    total_count = 0;
    for (let i = 0; i < document.getElementsByClassName("price").length; i++){
        let total_ammount = parseFloat(price[i].innerHTML) * 1000 * qty[i].value;
        total[i].innerHTML = total_ammount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        total_count += total_ammount;
    }
    total_all[0].innerHTML = total_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

}

function increaseCount(a, b) {
    var input = b.previousElementSibling;
    var value = parseInt(input.value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    input.value = value;
    calculateProduct();
}
    
function decreaseCount(a, b) {
    var input = b.nextElementSibling;
    var value = parseInt(input.value, 10);
    if (value > 1) {
        value = isNaN(value) ? 0 : value;
        value--;
        input.value = value;
    }
    calculateProduct();
}


function increaseCartCounter() {
    var value = parseInt(document.getElementById("cart-product-counter").innerHTML, 10);
    value += 1;
    document.getElementById("cart-product-counter").innerHTML = value;
}

