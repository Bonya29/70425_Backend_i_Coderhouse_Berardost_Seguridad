document.title = 'Home - Products'
let cartSelected = localStorage.getItem("cartSelected") || ""

async function selectCart() {
    let response = await fetch('/api/carts', {method: 'GET'})
    let data = await response.json()
    let carts = data.carts
    let inputOptions = {}
    carts.forEach(cart => {
        inputOptions[cart._id] = cart._id
    })
    
    const { value: selectedCart } = await Swal.fire({
        icon: "info",
        title: "Selecciona un carrito",
        text: "Alli se guardaran los productos que añadas al carrito",
        input: "select",
        inputOptions: inputOptions,
        inputPlaceholder: "Seleccionar carrito",
        showCancelButton: true,
        confirmButtonText: "Seleccionar",
        cancelButtonText: "Seleccionar luego",
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (!value) {
                    resolve("Debes seleccionar un carrito")
                } else {
                    resolve()
                }
            })
        }
    })

    if (selectedCart) {
        cartSelected = selectedCart
        localStorage.setItem("cartSelected", cartSelected)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            if (cartSelected === "") {
                swal.fire({
                    icon: "warning",
                    title: "No tienes un carrito seleccionado",
                    text: "Debes seleccionar un carrito antes de empezar a añadir productos",
                }).then(() => {
                    selectCart()
                })
            } else {
                const pid = button.getAttribute("id")
                const cid = cartSelected
                fetch(`/api/carts/${cid}/product/${pid}`, {method: "POST"})
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
            }
        })
    })

    document.querySelector(".cart-bubble").addEventListener("click", () => {
        if (cartSelected === "") {
            swal.fire({
                icon: "warning",
                title: "No tienes un carrito seleccionado",
                text: "Debes seleccionar un carrito antes de empezar a añadir productos",
            }).then(() => {
                selectCart()
            })
        } else {
            window.location.href = `/cart/${cartSelected}`
        }
        
    })
})