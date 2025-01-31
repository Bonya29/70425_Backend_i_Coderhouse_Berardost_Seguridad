document.title = 'Home - Products'

document.addEventListener("DOMContentLoaded", function () {
    let cartCount = 0
    const cartBubble = document.getElementById("cart-count")

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            cartCount++
            cartBubble.textContent = cartCount
            swal.fire({
                toast: true,
                title: "Producto Agregado al Carrito",
                position: "top-end",
                showConfirmButton: false,
                timer: 1750,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer
                    toast.onmouseleave = Swal.resumeTimer
                }
            })
        })
    })

    document.querySelector(".cart-bubble").addEventListener("click", () => {
        window.location.href = "/cart"
    })
})