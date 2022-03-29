function formatPrice() {
    const price = document.getElementsByClassName("price");
    const len = price.length;
    for (let i = 0; i < len; i++){
        price[i].innerHTML = price[i].innerHTML.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }
}

function unformatPrice(price) {
    if (price.includes("."))
        return parseFloat(price) * 1000;
    return parseInt(price);
}

function formatOnePrice(price) {
    return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function calculateProduct() {
    const price = document.getElementsByClassName("price");
    const len = price.length;
    const total = document.getElementsByClassName("total-product-price");
    const qty = document.getElementsByClassName("qty");
    const total_all = document.getElementsByClassName("count-price");
    var total_count = 0;

    for (let i = 0; i < len; i++){
        let total_ammount = parseFloat(price[i].innerHTML) * 1000 * qty[i].value;
        total[i].innerHTML = total_ammount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        total_count += total_ammount;
    }
    total_all[0].innerHTML = total_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

}


function increaseCartCounter() {
    var value = parseInt(document.getElementById("cart-product-counter").innerHTML, 10);
    value += 1;
    document.getElementById("cart-product-counter").innerHTML = value;


}

formatPrice();