document.addEventListener("DOMContentLoaded", () => {
    initializeCart();
    updateCartCount();
    updateCartSummary();
});

function getCart() {
    const cart = localStorage.getItem("novastore-cart");

    if (!cart) {
        return [];
    }

    try {
        return JSON.parse(cart);
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("novastore-cart", JSON.stringify(cart));
}

function initializeCart() {
    initializeAddToCartButtons();
    initializeQuantitySelectors();
    initializeRemoveButtons();
}

function initializeAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const product = getProductFromPage();

            if (!product) {
                return;
            }

            addToCart(product);
            showAddedMessage(button);
        });
    });
}

function getProductFromPage() {
    const productDetail = document.querySelector(".product-detail");

    if (!productDetail) {
        return null;
    }

    const name = productDetail.querySelector("h1");
    const price = productDetail.querySelector(".detail-price strong");
    const quantityInput = productDetail.querySelector(".quantity-selector input");

    if (!name || !price) {
        return null;
    }

    const productId = 1;
    const quantity = quantityInput ? Number(quantityInput.value) || 1 : 1;
    const numericPrice = Number(price.textContent.replace("$", "").trim());

    return {
        id: productId,
        name: name.textContent.trim(),
        price: numericPrice,
        quantity
    };
}

function addToCart(product) {
    const cart = getCart();
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    saveCart(cart);
    updateCartCount();
}

function initializeQuantitySelectors() {
    document.querySelectorAll(".quantity-selector").forEach((selector) => {
        const decreaseButton = selector.querySelector("button:first-child");
        const increaseButton = selector.querySelector("button:last-child");
        const input = selector.querySelector("input");

        if (!input) {
            return;
        }

        decreaseButton?.addEventListener("click", () => {
            const currentValue = Number(input.value) || 1;

            if (currentValue > 1) {
                input.value = currentValue - 1;
                input.dispatchEvent(new Event("change"));
            }
        });

        increaseButton?.addEventListener("click", () => {
            const currentValue = Number(input.value) || 1;

            input.value = currentValue + 1;
            input.dispatchEvent(new Event("change"));
        });

        input.addEventListener("change", () => {
            if (Number(input.value) < 1 || !Number(input.value)) {
                input.value = 1;
            }
        });
    });
}

function initializeRemoveButtons() {
    document.querySelectorAll(".cart-item-total button").forEach((button) => {
        button.addEventListener("click", () => {
            const cartItem = button.closest(".cart-item");

            if (!cartItem) {
                return;
            }

            const items = Array.from(document.querySelectorAll(".cart-item"));
            const index = items.indexOf(cartItem);

            if (index === -1) {
                return;
            }

            removeFromCart(index);
            cartItem.remove();
            updateCartCount();
            updateCartSummary();
        });
    });
}

function removeFromCart(index) {
    const cart = getCart();

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);
    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    const badges = document.querySelectorAll(
        ".header-action[href='/cart/'] .action-badge"
    );

    badges.forEach((badge) => {
        badge.textContent = count;
    });
}

function updateCartSummary() {
    const cart = getCart();

    if (!document.querySelector(".cart-summary")) {
        return;
    }

    const subtotalElement = document.querySelector(
        ".summary-row:nth-child(1) strong"
    );

    const totalElement = document.querySelector(
        ".summary-row.total strong"
    );

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }

    if (totalElement) {
        totalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

function showAddedMessage(button) {
    const originalHTML = button.innerHTML;

    button.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Added to Cart
    `;

    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }, 1500);
}