const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const card = document.querySelector(".page-card");

function injectWiltedStyles() {
    const style = document.createElement("style");
    style.textContent = `
    .wilted-petal {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        translate: -50% -50%;
        width: var(--petal-width);
        height: var(--petal-height);
        border-radius: 999px 999px 999px 0;
        background:
        radial-gradient(circle at 35% 35%, rgba(255, 205, 233, 0.95), rgba(190, 75, 139, 0.85) 60%, rgba(74, 31, 52, 0.2));
        box-shadow:
        0 0 10px rgba(190, 75, 139, 0.35),
        inset 0 0 8px rgba(255, 255, 255, 0.12);
        animation: wilted-petal-fall 1200ms ease-out forwards;
    }

    .wilted-thorn {
        position: fixed;
        z-index: 9998;
        pointer-events: none;
        translate: -50% -50%;
        width: 3.5rem;
        height: 3.5rem;
        border: 2px dashed rgba(69, 98, 65, 0.75);
        border-left-color: transparent;
        border-radius: 50%;
        filter: drop-shadow(0 0 8px rgba(190, 75, 139, 0.18));
        animation: wilted-thorn-curl 650ms ease-out forwards;
    }

    @keyframes wilted-petal-fall {
        0% {
            opacity: 0;
            transform:
            translate(0, 0)
            rotate(var(--petal-rotation))
            scale(0.2);
        }

        20% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform:
            translate(var(--petal-x), var(--petal-y))
            rotate(calc(var(--petal-rotation) + 160deg))
            scale(1);
        }
    }

    @keyframes wilted-thorn-curl {
        0% {
            opacity: 0.85;
            transform: rotate(0deg) scale(0.2);
        }

        100% {
            opacity: 0;
            transform: rotate(130deg) scale(1.6);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .wilted-petal,
        .wilted-thorn {
            display: none;
        }
    }
    `;

    document.head.appendChild(style);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function createPetal(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const petal = document.createElement("span");
    petal.className = "wilted-petal";

    const width = Math.floor(Math.random() * 12) + 10;
    const height = Math.floor(Math.random() * 18) + 16;
    const driftX = Math.floor(Math.random() * 120) - 60;
    const driftY = Math.floor(Math.random() * 80) + 20;
    const rotation = Math.floor(Math.random() * 360);

    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.setProperty("--petal-width", `${width}px`);
    petal.style.setProperty("--petal-height", `${height}px`);
    petal.style.setProperty("--petal-x", `${driftX}px`);
    petal.style.setProperty("--petal-y", `${driftY}px`);
    petal.style.setProperty("--petal-rotation", `${rotation}deg`);

    document.body.appendChild(petal);

    window.setTimeout(() => {
        petal.remove();
    }, 1250);
}

function createThornCurl(x, y) {
    if (prefersReducedMotion) {
        return;
    }

    const thorn = document.createElement("span");
    thorn.className = "wilted-thorn";
    thorn.style.left = `${x}px`;
    thorn.style.top = `${y}px`;

    document.body.appendChild(thorn);

    window.setTimeout(() => {
        thorn.remove();
    }, 700);
}

injectWiltedStyles();

if (card && !prefersReducedMotion) {
    window.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;

        const x = clamp(((localX / rect.width) - 0.5) * 2, -1, 1);
        const y = clamp(((localY / rect.height) - 0.5) * 2, -1, 1);

        root.style.setProperty("--vine-x", x.toFixed(3));
        root.style.setProperty("--vine-y", y.toFixed(3));
    });
}

window.addEventListener("click", (event) => {
    createThornCurl(event.clientX, event.clientY);

    for (let i = 0; i < 7; i++) {
        const offsetX = Math.random() * 52 - 26;
        const offsetY = Math.random() * 52 - 26;

        createPetal(event.clientX + offsetX, event.clientY + offsetY);
    }
});
