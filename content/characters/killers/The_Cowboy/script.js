const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const card = document.querySelector(".page-card");

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

if (card && !prefersReducedMotion) {
    window.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;

        const xPercent = clamp((localX / rect.width) * 100, 0, 100);
        const yPercent = clamp((localY / rect.height) * 100, 0, 100);

        const ropeX = ((localX / rect.width) - 0.5) * 26;
        const ropeY = ((localY / rect.height) - 0.5) * 18;

        root.style.setProperty("--cowboy-light-x", `${xPercent}%`);
        root.style.setProperty("--cowboy-light-y", `${yPercent}%`);
        root.style.setProperty("--cowboy-rope-x", ropeX.toFixed(2));
        root.style.setProperty("--cowboy-rope-y", ropeY.toFixed(2));
    });
}

function createDust(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const dust = document.createElement("span");
    dust.className = "cowboy-dust";

    const size = Math.floor(Math.random() * 28) + 16;
    const driftX = Math.floor(Math.random() * 110) - 55;
    const driftY = Math.floor(Math.random() * -70) - 10;

    dust.style.left = `${x}px`;
    dust.style.top = `${y}px`;
    dust.style.setProperty("--dust-size", `${size}px`);
    dust.style.setProperty("--dust-x", `${driftX}px`);
    dust.style.setProperty("--dust-y", `${driftY}px`);

    document.body.appendChild(dust);

    window.setTimeout(() => {
        dust.remove();
    }, 950);
}

function createFlash(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const flash = document.createElement("span");
    flash.className = "cowboy-flash";
    flash.style.left = `${x}px`;
    flash.style.top = `${y}px`;

    document.body.appendChild(flash);

    window.setTimeout(() => {
        flash.remove();
    }, 450);
}

window.addEventListener("click", (event) => {
    createFlash(event.clientX, event.clientY);

    for (let i = 0; i < 8; i++) {
        const offsetX = Math.random() * 44 - 22;
        const offsetY = Math.random() * 24 - 12;

        createDust(event.clientX + offsetX, event.clientY + offsetY);
    }
});
