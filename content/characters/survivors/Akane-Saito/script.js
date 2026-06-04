const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const card = document.querySelector(".page-card");

let lastPointerX = window.innerWidth / 2;
let lastPointerY = window.innerHeight / 2;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

if (card && !prefersReducedMotion) {
    window.addEventListener("pointermove", (event) => {
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;

        const rect = card.getBoundingClientRect();

        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;

        const xPercent = clamp((localX / rect.width) * 100, 0, 100);
        const yPercent = clamp((localY / rect.height) * 100, 0, 100);

        const emblemX = ((localX / rect.width) - 0.5) * 18;
        const emblemY = ((localY / rect.height) - 0.5) * 14;

        root.style.setProperty("--nurse-light-x", `${xPercent}%`);
        root.style.setProperty("--nurse-light-y", `${yPercent}%`);
        root.style.setProperty("--nurse-emblem-x", emblemX.toFixed(2));
        root.style.setProperty("--nurse-emblem-y", emblemY.toFixed(2));
    });
}

function createHeart(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const heart = document.createElement("span");
    heart.className = "nurse-heal-heart";

    const size = Math.floor(Math.random() * 10) + 10;
    const driftX = Math.floor(Math.random() * 80) - 40;
    const driftY = Math.floor(Math.random() * -80) - 24;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--heart-size", `${size}px`);
    heart.style.setProperty("--heart-x", `${driftX}px`);
    heart.style.setProperty("--heart-y", `${driftY}px`);

    document.body.appendChild(heart);

    window.setTimeout(() => {
        heart.remove();
    }, 950);
}

function createCross(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const cross = document.createElement("span");
    cross.className = "nurse-heal-cross";

    const size = Math.floor(Math.random() * 12) + 12;
    const driftX = Math.floor(Math.random() * 90) - 45;
    const driftY = Math.floor(Math.random() * -70) - 15;
    const rotation = Math.floor(Math.random() * 360);

    cross.style.left = `${x}px`;
    cross.style.top = `${y}px`;
    cross.style.setProperty("--cross-size", `${size}px`);
    cross.style.setProperty("--cross-x", `${driftX}px`);
    cross.style.setProperty("--cross-y", `${driftY}px`);
    cross.style.setProperty("--cross-rotation", `${rotation}deg`);

    document.body.appendChild(cross);

    window.setTimeout(() => {
        cross.remove();
    }, 750);
}

function createRing(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const ring = document.createElement("span");
    ring.className = "nurse-heal-ring";

    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;

    document.body.appendChild(ring);

    window.setTimeout(() => {
        ring.remove();
    }, 600);
}

function createShotLine(fromX, fromY, toX, toY) {
    if (prefersReducedMotion) {
        return;
    }

    const dx = toX - fromX;
    const dy = toY - fromY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const line = document.createElement("span");
    line.className = "nurse-shot-line";

    line.style.setProperty("--shot-left", `${fromX}px`);
    line.style.setProperty("--shot-top", `${fromY}px`);
    line.style.setProperty("--shot-width", `${distance}px`);
    line.style.setProperty("--shot-angle", `${angle}rad`);

    document.body.appendChild(line);

    window.setTimeout(() => {
        line.remove();
    }, 400);
}

window.addEventListener("click", (event) => {
    createRing(event.clientX, event.clientY);
    createShotLine(lastPointerX, lastPointerY, event.clientX, event.clientY);

    for (let i = 0; i < 5; i++) {
        const offsetX = Math.random() * 46 - 23;
        const offsetY = Math.random() * 46 - 23;

        createHeart(event.clientX + offsetX, event.clientY + offsetY);
    }

    for (let i = 0; i < 4; i++) {
        const offsetX = Math.random() * 52 - 26;
        const offsetY = Math.random() * 52 - 26;

        createCross(event.clientX + offsetX, event.clientY + offsetY);
    }
});
