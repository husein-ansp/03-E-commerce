document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const searchButton = document.getElementById("searchButton");
    const searchPanel = document.getElementById("searchPanel");
    const closeSearch = document.getElementById("closeSearch");
    const profileButton = document.getElementById("profileButton");
    const profileMenu = document.getElementById("profileMenu");
    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");
    const cartButton = document.getElementById("cartButton");
    const cartDrawer = document.getElementById("cartDrawer");
    const closeCart = document.getElementById("closeCart");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const themeButton = document.getElementById("themeButton");
    const wishlistButton = document.getElementById("wishlistButton");

    function closePanels() {
        searchPanel?.classList.remove("active");
        profileMenu?.classList.remove("active");
    }

    function openDrawer(drawer) {
        drawer?.classList.add("active");
        drawerOverlay?.classList.add("active");
        body.classList.add("no-scroll");
    }

    function closeDrawers() {
        notificationPanel?.classList.remove("active");
        cartDrawer?.classList.remove("active");
        drawerOverlay?.classList.remove("active");
        body.classList.remove("no-scroll");
    }

    searchButton?.addEventListener("click", () => {
        closePanels();
        closeDrawers();
        searchPanel?.classList.toggle("active");

        if (searchPanel?.classList.contains("active")) {
            searchPanel.querySelector("input")?.focus();
        }
    });

    closeSearch?.addEventListener("click", () => {
        searchPanel?.classList.remove("active");
    });

    profileButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        closeDrawers();
        searchPanel?.classList.remove("active");
        profileMenu?.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (
            profileMenu &&
            !profileMenu.contains(event.target) &&
            !profileButton?.contains(event.target)
        ) {
            profileMenu.classList.remove("active");
        }
    });

    notificationButton?.addEventListener("click", () => {
        closePanels();
        cartDrawer?.classList.remove("active");
        openDrawer(notificationPanel);
    });

    closeNotifications?.addEventListener("click", closeDrawers);

    cartButton?.addEventListener("click", () => {
        closePanels();
        notificationPanel?.classList.remove("active");
        openDrawer(cartDrawer);

        if (typeof loadMiniCart === "function") {
            loadMiniCart();
        }
    });

    closeCart?.addEventListener("click", closeDrawers);

    drawerOverlay?.addEventListener("click", closeDrawers);

    themeButton?.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        const isDark = body.classList.contains("dark-mode");

        localStorage.setItem("novaTheme", isDark ? "dark" : "light");

        updateThemeIcon();
    });

    function updateThemeIcon() {
        if (!themeButton) {
            return;
        }

        const icon = themeButton.querySelector("i");

        if (!icon) {
            return;
        }

        if (body.classList.contains("dark-mode")) {
            icon.className = "bi bi-sun";
        } else {
            icon.className = "bi bi-moon";
        }
    }

    if (localStorage.getItem("novaTheme") === "dark") {
        body.classList.add("dark-mode");
    }

    updateThemeIcon();

    wishlistButton?.addEventListener("click", () => {
        window.location.href = "/wishlist/";
    });

    document.querySelectorAll(".wishlist-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.product;

            if (!productId) {
                return;
            }

            try {
                const response = await fetch("/wishlist/toggle/", {
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
                    throw new Error("Wishlist request failed");
                }

                const data = await response.json();

                button.classList.toggle("active", data.added);

                const icon = button.querySelector("i");

                if (icon) {
                    icon.className = data.added
                        ? "bi bi-heart-fill"
                        : "bi bi-heart";
                }

                updateWishlistCount(data.count);

                showToast(
                    data.added
                        ? "Added to wishlist."
                        : "Removed from wishlist."
                );
            } catch (error) {
                showToast("Please login to use your wishlist.");
            }
        });
    });

    document.querySelectorAll(".wishlist-detail").forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.product;

            if (!productId) {
                return;
            }

            try {
                const response = await fetch("/wishlist/toggle/", {
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
                    throw new Error("Wishlist request failed");
                }

                const data = await response.json();

                button.classList.toggle("active", data.added);

                const icon = button.querySelector("i");

                if (icon) {
                    icon.className = data.added
                        ? "bi bi-heart-fill"
                        : "bi bi-heart";
                }

                updateWishlistCount(data.count);

                showToast(
                    data.added
                        ? "Added to wishlist."
                        : "Removed from wishlist."
                );
            } catch (error) {
                showToast("Please login to use your wishlist.");
            }
        });
    });

    document.querySelectorAll(".add-cart").forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.product;

            await addToCart(productId, 1);
        });
    });

    document.querySelectorAll(".add-detail-cart").forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.product;
            const quantityElement = document.getElementById("quantity");

            const quantity = quantityElement
                ? parseInt(quantityElement.textContent, 10)
                : 1;

            await addToCart(productId, quantity);
        });
    });

    async function addToCart(productId, quantity) {
        if (!productId) {
            return;
        }

        try {
            const response = await fetch("/cart/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error("Cart request failed");
            }

            const data = await response.json();

            updateCartCount(data.count);

            showToast("Product added to cart.");

            if (
                cartDrawer &&
                cartDrawer.classList.contains("active") &&
                typeof loadMiniCart === "function"
            ) {
                loadMiniCart();
            }
        } catch (error) {
            showToast("Could not add product to cart.");
        }
    }

    async function loadMiniCart() {
        const container = document.getElementById("miniCartItems");
        const total = document.getElementById("miniCartTotal");

        if (!container) {
            return;
        }

        try {
            const response = await fetch("/cart/data/");

            if (!response.ok) {
                throw new Error("Cart data failed");
            }

            const data = await response.json();

            updateCartCount(data.count);

            if (total) {
                total.textContent = `$${data.total.toFixed(2)}`;
            }

            if (!data.items.length) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="bi bi-bag-x"></i>
                        <h6>Your cart is empty</h6>
                        <p>Add something you like.</p>
                    </div>
                `;

                return;
            }

            container.innerHTML = data.items.map((item) => `
                <div class="mini-cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <strong>${item.name}</strong>
                        <span>${item.quantity} × $${item.price}</span>
                    </div>
                </div>
            `).join("");
        } catch (error) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="bi bi-exclamation-circle"></i>
                    <h6>Unable to load cart</h6>
                </div>
            `;
        }
    }

    function updateCartCount(count) {
        const element = document.getElementById("cartCount");

        if (element) {
            element.textContent = count;
        }
    }

    function updateWishlistCount(count) {
        const element = document.getElementById("wishlistCount");

        if (element) {
            element.textContent = count;
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

    function showToast(message) {
        const toastElement = document.getElementById("appToast");
        const messageElement = document.getElementById("toastMessage");

        if (!toastElement || !messageElement) {
            return;
        }

        messageElement.textContent = message;

        const toast = bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 2500
            }
        );

        toast.show();
    }

    window.addToCart = addToCart;
    window.loadMiniCart = loadMiniCart;
    window.updateCartCount = updateCartCount;
    window.updateWishlistCount = updateWishlistCount;
    window.showToast = showToast;
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }
});