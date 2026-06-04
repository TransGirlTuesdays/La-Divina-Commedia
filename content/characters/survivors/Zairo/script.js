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

        const decoX = ((localX / rect.width) - 0.5) * 20;
        const decoY = ((localY / rect.height) - 0.5) * 16;

        root.style.setProperty("--alien-light-x", `${xPercent}%`);
        root.style.setProperty("--alien-light-y", `${yPercent}%`);
        root.style.setProperty("--alien-deco-x", decoX.toFixed(2));
        root.style.setProperty("--alien-deco-y", decoY.toFixed(2));
    });
}

function createOrb(x, y) {
    if (prefersReducedMotion) return;

    const orb = document.createElement("span");
    orb.className = "alien-orb";

    const size = Math.floor(Math.random() * 13) + 10;
    const driftX = Math.floor(Math.random() * 100) - 50;
    const driftY = Math.floor(Math.random() * -85) - 16;

    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    orb.style.setProperty("--orb-size", `${size}px`);
    orb.style.setProperty("--orb-x", `${driftX}px`);
    orb.style.setProperty("--orb-y", `${driftY}px`);

    document.body.appendChild(orb);

    window.setTimeout(() => {
        orb.remove();
    }, 950);
}

function createScanRing(x, y) {
    if (prefersReducedMotion) return;

    const ring = document.createElement("span");
    ring.className = "alien-scan-ring";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;

    document.body.appendChild(ring);

    window.setTimeout(() => {
        ring.remove();
    }, 650);
}

function createSignalLine(fromX, fromY, toX, toY) {
    if (prefersReducedMotion) return;

    const dx = toX - fromX;
    const dy = toY - fromY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const line = document.createElement("span");
    line.className = "alien-signal-line";

    line.style.setProperty("--signal-left", `${fromX}px`);
    line.style.setProperty("--signal-top", `${fromY}px`);
    line.style.setProperty("--signal-width", `${distance}px`);
    line.style.setProperty("--signal-angle", `${angle}rad`);

    document.body.appendChild(line);

    window.setTimeout(() => {
        line.remove();
    }, 460);
}

window.addEventListener("click", (event) => {
    createScanRing(event.clientX, event.clientY);
    createSignalLine(lastPointerX, lastPointerY, event.clientX, event.clientY);

    for (let i = 0; i < 9; i++) {
        const offsetX = Math.random() * 52 - 26;
        const offsetY = Math.random() * 52 - 26;

        createOrb(event.clientX + offsetX, event.clientY + offsetY);
    }
});
