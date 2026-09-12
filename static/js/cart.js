document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) {
        return;
    }

    loadCart();

    async function loadCart() {
        try {
            const response = await fetch("/cart/data/");

            if (!response.ok) {
                throw new Error("Cart loading failed");
            }

            const data = await response.json();

            renderCart(data);
        } catch (error) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="bi bi-exclamation-circle"></i>
                    <h6>Unable to load cart</h6>
                    <p>Please try again.</p>
                </div>
            `;
        }
    }

    function renderCart(data) {
        if (!data.items.length) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="bi bi-bag-x"></i>
                    <h6>Your cart is empty</h6>
                    <p>Add products to continue.</p>
                    <a href="/products/" class="btn btn-primary">
                        Continue Shopping
                    </a>
                </div>
            `;

            updateTotals(0, 0);

            return;
        }

        cartItems.innerHTML = data.items.map((item) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${
                        item.image
                            ? `<img src="${item.image}" alt="${item.name}">`
                            : `<i class="bi bi-image"></i>`
                    }
                </div>

                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <span>${item.category}</span>

                    <div class="cart-quantity">
                        <button
                            type="button"
                            class="quantity-minus"
                            data-id="${item.id}">
                            <i class="bi bi-dash"></i>
                        </button>

                        <strong>${item.quantity}</strong>

                        <button
                            type="button"
                            class="quantity-plus"
                            data-id="${item.id}">
                            <i class="bi bi-plus"></i>
                        </button>

                        <button
                            type="button"
                            class="remove-cart"
                            data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="cart-item-price">
                    $${item.subtotal.toFixed(2)}
                </div>
            </div>
        `).join("");

        updateTotals(data.subtotal, data.shipping);

        addCartEvents();
    }

    function addCartEvents() {
        document.querySelectorAll(".quantity-minus").forEach((button) => {
            button.addEventListener("click", () => {
                updateQuantity(
                    button.dataset.id,
                    "decrease"
                );
            });
        });

        document.querySelectorAll(".quantity-plus").forEach((button) => {
            button.addEventListener("click", () => {
                updateQuantity(
                    button.dataset.id,
                    "increase"
                );
            });
        });

        document.querySelectorAll(".remove-cart").forEach((button) => {
            button.addEventListener("click", () => {
                removeItem(button.dataset.id);
            });
        });
    }

    async function updateQuantity(productId, action) {
        try {
            const response = await fetch("/cart/update/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    product_id: productId,
                    action: action
                })
            });

            if (!response.ok) {
                throw new Error("Update failed");
            }

            const data = await response.json();

            renderCart(data);

            if (typeof updateCartCount === "function") {
                updateCartCount(data.count);
            }
        } catch (error) {
            showToastMessage("Could not update cart.");
        }
    }

    async function removeItem(productId) {
        try {
            const response = await fetch("/cart/remove/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });

            if (!response.ok) {
                throw new Error("Remove failed");
            }

            const data = await response.json();

            renderCart(data);

            if (typeof updateCartCount === "function") {
                updateCartCount(data.count);
            }

            showToastMessage("Product removed from cart.");
        } catch (error) {
            showToastMessage("Could not remove product.");
        }
    }

    function updateTotals(subtotal, shipping) {
        const subtotalElement =
            document.getElementById("cartSubtotal");

        const shippingElement =
            document.getElementById("cartShipping");

        const totalElement =
            document.getElementById("cartTotal");

        const total = subtotal + shipping;

        if (subtotalElement) {
            subtotalElement.textContent =
                `$${subtotal.toFixed(2)}`;
        }

        if (shippingElement) {
            shippingElement.textContent =
                `$${shipping.toFixed(2)}`;
        }

        if (totalElement) {
            totalElement.textContent =
                `$${total.toFixed(2)}`;
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split(";");

        for (const cookie of cookies) {
            const trimmed = cookie.trim();

            if (trimmed.startsWith(`${name}=`)) {
                return decodeURIComponent(
                    trimmed.substring(name.length + 1)
                );
            }
        }

        return "";
    }

    function showToastMessage(message) {
        if (typeof showToast === "function") {
            showToast(message);
        }
    }
});