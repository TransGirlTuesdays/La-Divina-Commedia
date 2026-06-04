const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const card = document.querySelector(".page-card");

const sprinkleColors = ["#ff4fae", "#ff9bd2", "#a8d7ff", "#ffe875", "#ffffff"];

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

        const decoX = ((localX / rect.width) - 0.5) * 20;
        const decoY = ((localY / rect.height) - 0.5) * 16;

        root.style.setProperty("--kiki-light-x", `${xPercent}%`);
        root.style.setProperty("--kiki-light-y", `${yPercent}%`);
        root.style.setProperty("--kiki-deco-x", decoX.toFixed(2));
        root.style.setProperty("--kiki-deco-y", decoY.toFixed(2));
    });
}

function createSprinkle(x, y) {
    if (prefersReducedMotion) return;

    const sprinkle = document.createElement("span");
    sprinkle.className = "kiki-sprinkle";

    const driftX = Math.floor(Math.random() * 130) - 65;
    const driftY = Math.floor(Math.random() * 100) - 60;
    const rotation = Math.floor(Math.random() * 360);
    const width = Math.floor(Math.random() * 18) + 14;
    const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];

    sprinkle.style.left = `${x}px`;
    sprinkle.style.top = `${y}px`;
    sprinkle.style.setProperty("--sprinkle-x", `${driftX}px`);
    sprinkle.style.setProperty("--sprinkle-y", `${driftY}px`);
    sprinkle.style.setProperty("--sprinkle-rotation", `${rotation}deg`);
    sprinkle.style.setProperty("--sprinkle-width", `${width}px`);
    sprinkle.style.setProperty("--sprinkle-color", color);

    document.body.appendChild(sprinkle);

    window.setTimeout(() => {
        sprinkle.remove();
    }, 850);
}

function createImpactRing(x, y) {
    if (prefersReducedMotion) return;

    const ring = document.createElement("span");
    ring.className = "kiki-impact-ring";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;

    document.body.appendChild(ring);

    window.setTimeout(() => {
        ring.remove();
    }, 560);
}

function createCandyStar(x, y) {
    if (prefersReducedMotion) return;

    const star = document.createElement("span");
    star.className = "kiki-candy-star";

    const size = Math.floor(Math.random() * 13) + 12;
    const driftX = Math.floor(Math.random() * 90) - 45;
    const driftY = Math.floor(Math.random() * -80) - 20;
    const rotation = Math.floor(Math.random() * 360);

    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-x", `${driftX}px`);
    star.style.setProperty("--star-y", `${driftY}px`);
    star.style.setProperty("--star-rotation", `${rotation}deg`);

    document.body.appendChild(star);

    window.setTimeout(() => {
        star.remove();
    }, 750);
}

window.addEventListener("click", (event) => {
    createImpactRing(event.clientX, event.clientY);

    for (let i = 0; i < 14; i++) {
        const offsetX = Math.random() * 54 - 27;
        const offsetY = Math.random() * 54 - 27;
        createSprinkle(event.clientX + offsetX, event.clientY + offsetY);
    }

    for (let i = 0; i < 4; i++) {
        const offsetX = Math.random() * 42 - 21;
        const offsetY = Math.random() * 42 - 21;
        createCandyStar(event.clientX + offsetX, event.clientY + offsetY);
    }
});
