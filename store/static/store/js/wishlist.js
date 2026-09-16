document.addEventListener("DOMContentLoaded", () => {
    initializeWishlist();
    updateWishlistCount();
});

function getWishlist() {
    const wishlist = localStorage.getItem("novastore-wishlist");

    if (!wishlist) {
        return [];
    }

    try {
        return JSON.parse(wishlist);
    } catch {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem("novastore-wishlist", JSON.stringify(wishlist));
}

function initializeWishlist() {
    const wishlistButtons = document.querySelectorAll(
        ".product-wishlist, .gallery-wishlist"
    );

    const wishlist = getWishlist();

    wishlistButtons.forEach((button) => {
        const productId = getProductId(button);

        if (productId && wishlist.includes(productId)) {
            setWishlistButtonState(button, true);
        }

        button.addEventListener("click", () => {
            const currentId = getProductId(button);

            if (!currentId) {
                return;
            }

            toggleWishlist(currentId);
            updateWishlistButtons();
        });
    });
}

function getProductId(button) {
    const productCard = button.closest(".product-card");
    const productDetail = button.closest(".product-detail");

    if (productCard) {
        const link = productCard.querySelector(".product-button");

        if (link) {
            const match = link.getAttribute("href").match(/\/products\/(\d+)\//);

            if (match) {
                return Number(match[1]);
            }
        }
    }

    if (productDetail) {
        return 1;
    }

    return null;
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();

    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter((id) => id !== productId);
    } else {
        wishlist.push(productId);
    }

    saveWishlist(wishlist);
    updateWishlistCount();
}

function updateWishlistButtons() {
    const wishlist = getWishlist();

    document.querySelectorAll(
        ".product-wishlist, .gallery-wishlist"
    ).forEach((button) => {
        const productId = getProductId(button);

        if (!productId) {
            return;
        }

        setWishlistButtonState(button, wishlist.includes(productId));
    });
}

function setWishlistButtonState(button, active) {
    const icon = button.querySelector("i");

    if (!icon) {
        return;
    }

    if (active) {
        button.classList.add("active");
        icon.className = "bi bi-heart-fill";
    } else {
        button.classList.remove("active");
        icon.className = "bi bi-heart";
    }
}

function updateWishlistCount() {
    const count = getWishlist().length;
    const badges = document.querySelectorAll(
        ".header-action[href='/wishlist/'] .action-badge"
    );

    badges.forEach((badge) => {
        badge.textContent = count;
    });
}