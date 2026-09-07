document.addEventListener("DOMContentLoaded", () => {
    const wishlistButtons =
        document.querySelectorAll(".wishlist-btn, .wishlist-detail");

    wishlistButtons.forEach((button) => {
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

                if (typeof updateWishlistCount === "function") {
                    updateWishlistCount(data.count);
                }

                if (typeof showToast === "function") {
                    showToast(
                        data.added
                            ? "Added to wishlist."
                            : "Removed from wishlist."
                    );
                }
            } catch (error) {
                if (typeof showToast === "function") {
                    showToast(
                        "Please login to use your wishlist."
                    );
                }
            }
        });
    });

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
});