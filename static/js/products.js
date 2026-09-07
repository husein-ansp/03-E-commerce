document.addEventListener("DOMContentLoaded", () => {
    const filterButton = document.getElementById("filterButton");
    const filters = document.getElementById("filters");
    const closeFilters = document.getElementById("closeFilters");

    filterButton?.addEventListener("click", () => {
        filters?.classList.add("active");
    });

    closeFilters?.addEventListener("click", () => {
        filters?.classList.remove("active");
    });
});