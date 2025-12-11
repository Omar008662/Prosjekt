// =========================
// HENT HANDLEKURV
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =========================
// DOM-ELEMENTER (CHECKOUT)
// =========================
const cartContainer = document.querySelector(".cart-items");
const subtotalElement = document.querySelector(".subtotal");
const grandTotalElement = document.querySelector(".grand-total");
const totalPriceElement = document.querySelector(".total-price");

const SHIPPING = 49;

// =========================
// LAGRE HANDLEKURV
// =========================
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

// =========================
// OPPDATER HANDLEKURV-IKON
// =========================
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBtn = document.querySelector(".cart-btn");

    if (!cartBtn) return;

    // Fjern tidligere ikon
    let badge = document.querySelector(".cart-count");
    if (badge) badge.remove();

    // Legg til nytt antall
    if (count > 0) {
        const span = document.createElement("span");
        span.classList.add("cart-count");
        span.textContent = count;
        cartBtn.appendChild(span);
    }
}

// =========================
// OPPDATER VISNING (CHECKOUT)
// =========================
function updateCart() {
    if (!cartContainer) return;

    cartContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">

                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>kr ${item.price}</p>
                </div>

                <div class="quantity-controls">
                    <button class="minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="plus" data-index="${index}">+</button>
                </div>

                <button class="remove" data-index="${index}">X</button>
            </div>
        `;
    });

    if (totalPriceElement) totalPriceElement.textContent = subtotal + " kr";
    if (subtotalElement) subtotalElement.textContent = "kr " + subtotal;
    if (grandTotalElement) grandTotalElement.textContent = "kr " + (subtotal + SHIPPING);

    saveCart();
}

// =========================
// LEGG TIL PRODUKT (PRODUKTSIDE)
// =========================
const buyButtons = document.querySelectorAll(".buy-btn");

buyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);
        const image = btn.dataset.img;

        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name,
                price,
                image,
                quantity: 1
            });
        }

        saveCart();
    });
});

// =========================
// KLIPP-HÅNDTERING PÅ CHECKOUT
// =========================
document.addEventListener("click", (e) => {
    const index = e.target.dataset.index;

    if (e.target.classList.contains("plus")) {
        cart[index].quantity++;
        updateCart();
    }

    if (e.target.classList.contains("minus")) {
        cart[index].quantity--;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCart();
    }

    if (e.target.classList.contains("remove")) {
        cart.splice(index, 1);
        updateCart();
    }
});

// =========================
// INIT
// =========================
updateCartCount();
updateCart();
