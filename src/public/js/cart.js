document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".del").forEach(button => {
        button.addEventListener("click", () => {
            Swal.fire({
                title: "Confirmar Eliminación",
                text: `¿Estas seguro que deseas eliminar el producto del carrito?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar"
            })
            .then((result) => {
                if (result.isConfirmed) {
                    const pid = button.getAttribute("id")
                    const cid = document.getElementById("cart-container").getAttribute("data-cid")
                    fetch(`/api/carts/${cid}/product/${pid}`, {method: "DELETE"})
                    Swal.fire({
                    title: "Producto Eliminado!",
                    text: "El producto a sido eliminado con exito",
                    icon: "success"
                    })
                    .then(() => location.reload());
                }
            })
        })
    })
})

function clearCart() {
    const cid = document.getElementById("cart-container").getAttribute("data-cid")
    Swal.fire({
        title: "Vaciar Carrito",
        text: `¿Estas seguro que deseas vaciar el carrito?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Si, Vaciar",
        cancelButtonText: "Cancelar"
    })
    .then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/carts/${cid}`, {method: "DELETE"})
            Swal.fire({
            title: "Carrito Vaciado!",
            text: "El carrito a sido vaciado con exito",
            icon: "success"
            })
            .then(() => location.reload());
        }
    })
}