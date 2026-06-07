(() => {
    const card = document.querySelector(".page-card");
    const content = document.querySelector(".page-content");

    if (!card) {
        return;
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    /*
     * Turn each content block into a slightly hinged doll section.
     * They unfold as the user scrolls down the page.
     */
    const sections = content
    ? Array.from(content.children)
    : [];

    sections.forEach((section, index) => {
        section.classList.add("doll-jointed-section");

        const initialAngle = index % 2 === 0
        ? -1.8
        : 1.8;

        section.style.setProperty(
            "--joint-angle",
            `${initialAngle}deg`
        );
    });

    if (prefersReducedMotion) {
        sections.forEach((section) => {
            section.classList.add("is-stitched-in");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-stitched-in");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -5% 0px"
        }
    );

    sections.forEach((section) => {
        observer.observe(section);
    });

    /*
     * Add the stitched button eye.
     * It rotates toward the cursor rather than creating click particles.
     */
    const buttonEye = document.createElement("div");
    buttonEye.className = "doll-button-eye";
    buttonEye.setAttribute("aria-hidden", "true");
    card.appendChild(buttonEye);

    /*
     * Add marionette strings.
     */
    const stringDefinitions = [
        "doll-string-left",
        "doll-string-center",
        "doll-string-right"
    ];

    const strings = stringDefinitions.map((className) => {
        const string = document.createElement("span");

        string.className =
        `doll-marionette-string ${className}`;

        string.setAttribute("aria-hidden", "true");
        card.appendChild(string);

        return string;
    });

    /*
     * Add a viewport-sized SVG.
     * A stitched thread bends from the button eye toward the cursor.
     */
    const svgNamespace = "http://www.w3.org/2000/svg";

    const threadSvg = document.createElementNS(
        svgNamespace,
        "svg"
    );

    threadSvg.classList.add("doll-thread-overlay");
    threadSvg.setAttribute("aria-hidden", "true");
    threadSvg.setAttribute("preserveAspectRatio", "none");

    const threadPath = document.createElementNS(
        svgNamespace,
        "path"
    );

    const needle = document.createElementNS(
        svgNamespace,
        "path"
    );

    needle.classList.add("doll-thread-needle");

    threadSvg.appendChild(threadPath);
    threadSvg.appendChild(needle);
    document.body.appendChild(threadSvg);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let pointerX = targetX;
    let pointerY = targetY;

    let pointerActive = false;

    function updatePointer(event) {
        targetX = event.clientX;
        targetY = event.clientY;

        pointerActive = true;
        threadSvg.classList.add("is-active");
    }

    window.addEventListener(
        "pointermove",
        updatePointer,
        { passive: true }
    );

    /*
     * Hide the loose thread when the pointer leaves the window.
     */
    window.addEventListener("mouseout", (event) => {
        if (event.relatedTarget === null) {
            pointerActive = false;
            threadSvg.classList.remove("is-active");
        }
    });

    function updateButtonEye() {
        const eyeRect = buttonEye.getBoundingClientRect();

        const eyeX = eyeRect.left + eyeRect.width / 2;
        const eyeY = eyeRect.top + eyeRect.height / 2;

        const angle = Math.atan2(
            pointerY - eyeY,
            pointerX - eyeX
        );

        buttonEye.style.setProperty(
            "--button-angle",
            `${angle * (180 / Math.PI) + 45}deg`
        );

        return {
            x: eyeX,
            y: eyeY
        };
    }

    function updateThread(eyePosition) {
        const startX = eyePosition.x;
        const startY = eyePosition.y;

        const endX = pointerX;
        const endY = pointerY;

        const distanceX = endX - startX;
        const distanceY = endY - startY;

        /*
         * The control point creates a loose, hanging thread rather
         * than a perfectly straight cursor line.
         */
        const controlX =
        startX +
        distanceX * 0.48 -
        distanceY * 0.09;

        const controlY =
        startY +
        distanceY * 0.44 +
        Math.min(
            85,
            Math.abs(distanceX) * 0.12 + 25
        );

        threadPath.setAttribute(
            "d",
            `M ${startX} ${startY}
            Q ${controlX} ${controlY}
            ${endX} ${endY}`
        );

        /*
         * Draw a tiny needle at the cursor-facing end of the thread.
         */
        const needleLength = 14;

        const needleAngle = Math.atan2(
            endY - controlY,
            endX - controlX
        );

        const needleStartX =
        endX -
        Math.cos(needleAngle) * needleLength;

        const needleStartY =
        endY -
        Math.sin(needleAngle) * needleLength;

        needle.setAttribute(
            "d",
            `M ${needleStartX} ${needleStartY}
            L ${endX} ${endY}`
        );
    }

    function updateCardMotion() {
        const normalizedX =
        pointerX / window.innerWidth - 0.5;

        const normalizedY =
        pointerY / window.innerHeight - 0.5;

        card.style.setProperty(
            "--doll-tilt-x",
            `${normalizedX * 2.3}deg`
        );

        card.style.setProperty(
            "--doll-tilt-y",
            `${normalizedY * -1.7}deg`
        );

        card.style.setProperty(
            "--doll-shadow-x",
            `${normalizedX * -14}px`
        );

        card.style.setProperty(
            "--doll-shadow-y",
            `${28 + normalizedY * 8}px`
        );

        /*
         * Each string sways by a slightly different amount,
         * making the page feel suspended rather than rigid.
         */
        strings.forEach((string, index) => {
            const strength = 4.4 + index * 1.1;
            const offset = index === 1
            ? normalizedY * 1.3
            : 0;

            string.style.setProperty(
                "--string-angle",
                `${normalizedX * strength + offset}deg`
            );
        });
    }

    function updateJointPull() {
        /*
         * Nearby page sections subtly lean toward the cursor,
         * like their joints are being tugged by invisible strings.
         */
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (
                rect.bottom < 0 ||
                rect.top > window.innerHeight
            ) {
                return;
            }

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX =
            (pointerX - centerX) /
            Math.max(rect.width, 1);

            const distanceY =
            (pointerY - centerY) /
            Math.max(rect.height, 1);

            const pullX = clamp(
                distanceX * 3.2,
                -3,
                3
            );

            const pullY = clamp(
                distanceY * 2,
                -2,
                2
            );

            section.style.setProperty(
                "--joint-x",
                `${pullX}px`
            );

            section.style.setProperty(
                "--joint-y",
                `${pullY}px`
            );
        });
    }

    function animate() {
        /*
         * Smooth the pointer values so the strings and thread
         * feel weighted instead of snapping instantly.
         */
        pointerX += (targetX - pointerX) * 0.12;
        pointerY += (targetY - pointerY) * 0.12;

        const eyePosition = updateButtonEye();

        if (pointerActive) {
            updateThread(eyePosition);
        }

        updateCardMotion();
        updateJointPull();

        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
})();
