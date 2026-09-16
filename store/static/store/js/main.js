document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeTooltips();
    initializeNewsletter();
    initializeMobileFilters();
});

function initializeTheme() {
    const themeToggle = document.querySelector(".theme-toggle");

    if (!themeToggle) {
        return;
    }

    const savedTheme = localStorage.getItem("novastore-theme");

    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        updateThemeIcon(themeToggle, true);
    }

    themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("novastore-theme", "light");
            updateThemeIcon(themeToggle, false);
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("novastore-theme", "dark");
            updateThemeIcon(themeToggle, true);
        }
    });
}

function updateThemeIcon(button, isDark) {
    const icon = button.querySelector("i");

    if (!icon) {
        return;
    }

    icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
}

function initializeTooltips() {
    if (typeof bootstrap === "undefined") {
        return;
    }

    const tooltipElements = document.querySelectorAll("[data-bs-toggle='tooltip']");

    tooltipElements.forEach((element) => {
        new bootstrap.Tooltip(element);
    });
}

function initializeNewsletter() {
    const newsletterForm = document.querySelector(".newsletter-form");

    if (!newsletterForm) {
        return;
    }

    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const input = newsletterForm.querySelector("input");
        const email = input.value.trim();

        if (!email) {
            input.focus();
            return;
        }

        if (!isValidEmail(email)) {
            input.focus();
            return;
        }

        const button = newsletterForm.querySelector("button");

        if (button) {
            const originalText = button.innerHTML;

            button.innerHTML = `
                Subscribed
                <i class="bi bi-check-lg"></i>
            `;

            button.disabled = true;

            setTimeout(() => {
                input.value = "";
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2500);
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initializeMobileFilters() {
    const filterButton = document.querySelector(".mobile-filter-button button");
    const filtersSidebar = document.querySelector(".filters-sidebar");

    if (!filterButton || !filtersSidebar) {
        return;
    }

    filterButton.addEventListener("click", () => {
        filtersSidebar.classList.toggle("active");

        const isOpen = filtersSidebar.classList.contains("active");

        filterButton.innerHTML = isOpen
            ? '<i class="bi bi-x-lg"></i> Close Filters'
            : '<i class="bi bi-sliders"></i> Filters';
    });
}