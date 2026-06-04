window.addEventListener("DOMContentLoaded", () => {
    const searchElement = document.querySelector("#search-input");

    if (!searchElement || !window.PagefindUI) {
        return;
    }

    new PagefindUI({
        element: "#search-input",
        showSubResults: true,
        showImages: false,
        resetStyles: false
    });
});
