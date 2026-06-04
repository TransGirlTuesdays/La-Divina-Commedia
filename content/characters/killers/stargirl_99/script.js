const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createSparkle(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const sparkle = document.createElement("span");
    sparkle.className = "click-sparkle";

    const size = Math.floor(Math.random() * 12) + 10;
    const rotation = Math.floor(Math.random() * 360);
    const driftX = Math.floor(Math.random() * 80) - 40;
    const driftY = Math.floor(Math.random() * -60) - 18;

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.setProperty("--sparkle-rotation", `${rotation}deg`);
    sparkle.style.setProperty("--sparkle-drift-x", `${driftX}px`);
    sparkle.style.setProperty("--sparkle-drift-y", `${driftY}px`);

    document.body.appendChild(sparkle);

    window.setTimeout(() => {
        sparkle.remove();
    }, 750);
}

window.addEventListener("click", (event) => {
    for (let i = 0; i < 8; i++) {
        const offsetX = Math.random() * 46 - 23;
        const offsetY = Math.random() * 46 - 23;

        createSparkle(event.clientX + offsetX, event.clientY + offsetY);
    }
});
