document.addEventListener("DOMContentLoaded", async () => {
    const itemsContainer = document.getElementById("checkoutItems");
    const subtotalElement = document.getElementById("checkoutSubtotal");
    const shippingElement = document.getElementById("checkoutShipping");
    const totalElement = document.getElementById("checkoutTotal");

    if (!itemsContainer) {
        return;
    }

    try {
        const response = await fetch("/cart/data/");

        if (!response.ok) {
            throw new Error("Cart request failed");
        }

        const data = await response.json();

        if (!data.items.length) {
            itemsContainer.innerHTML = `
                <div class="checkout-empty">
                    <i class="bi bi-bag-x"></i>
                    <span>Your cart is empty.</span>
                </div>
            `;
            return;
        }

        itemsContainer.innerHTML = data.items.map((item) => `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    ${
                        item.image
                            ? `<img src="${item.image}" alt="${item.name}">`
                            : `<i class="bi bi-image"></i>`
                    }
                </div>

                <div class="checkout-item-info">
                    <strong>${item.name}</strong>
                    <span>${item.quantity} × $${item.price.toFixed(2)}</span>
                </div>

                <strong>
                    $${item.subtotal.toFixed(2)}
                </strong>
            </div>
        `).join("");

        subtotalElement.textContent =
            `$${data.subtotal.toFixed(2)}`;

        shippingElement.textContent =
            `$${data.shipping.toFixed(2)}`;

        totalElement.textContent =
            `$${data.total.toFixed(2)}`;

    } catch (error) {
        itemsContainer.innerHTML = `
            <div class="checkout-empty">
                <i class="bi bi-exclamation-circle"></i>
                <span>Unable to load your order.</span>
            </div>
        `;
    }
});