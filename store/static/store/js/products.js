document.addEventListener("DOMContentLoaded", () => {
    initializeGallery();
    initializeProductTabs();
    initializeColorOptions();
    initializeProductSort();
});

function initializeGallery() {
    const mainImage = document.querySelector(".product-main-image .product-placeholder");
    const thumbnails = document.querySelectorAll(".thumbnail");

    if (!mainImage || !thumbnails.length) {
        return;
    }

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            thumbnails.forEach((item) => item.classList.remove("active"));
            thumbnail.classList.add("active");

            const icon = thumbnail.querySelector("i");

            if (icon) {
                mainImage.innerHTML = `
                    <i class="${icon.className}"></i>
                `;
            }
        });
    });
}

function initializeProductTabs() {
    const tabs = document.querySelectorAll(".product-tab");

    if (!tabs.length) {
        return;
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}

function initializeColorOptions() {
    const colorOptions = document.querySelectorAll(".color-option");

    colorOptions.forEach((option) => {
        option.addEventListener("click", () => {
            colorOptions.forEach((item) => item.classList.remove("active"));
            option.classList.add("active");
        });
    });
}

function initializeProductSort() {
    const sortSelect = document.querySelector("#sort-products");

    if (!sortSelect) {
        return;
    }

    sortSelect.addEventListener("change", () => {
        const selectedValue = sortSelect.value;
        const productGrid = document.querySelector(".products-content .product-grid");

        if (!productGrid) {
            return;
        }

        const products = Array.from(
            productGrid.querySelectorAll(".product-card")
        );

        if (selectedValue === "price-low") {
            products.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        }

        if (selectedValue === "price-high") {
            products.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        }

        if (selectedValue === "rating") {
            products.sort((a, b) => getProductRating(b) - getProductRating(a));
        }

        products.forEach((product) => {
            productGrid.appendChild(product);
        });
    });
}

function getProductPrice(product) {
    const priceElement = product.querySelector(".product-price strong");

    if (!priceElement) {
        return 0;
    }

    return Number(
        priceElement.textContent.replace("$", "").trim()
    ) || 0;
}

function getProductRating(product) {
    const ratingElement = product.querySelector(".product-rating small");

    if (!ratingElement) {
        return 0;
    }

    const match = ratingElement.textContent.match(/\d+/);

    return match ? Number(match[0]) : 0;
}