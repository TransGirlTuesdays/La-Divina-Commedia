import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

const SHOW_DRAFTS = process.env.SHOW_DRAFTS === "1";

function normalizePath(value) {
    return value.split(path.sep).join("/");
}

function escapeHtml(value = "") {
    return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugifySegment(value) {
    return value
    .toLowerCase()
    .trim()
    .replace(/^_+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugFromContentDir(pageDir) {
    const relative = normalizePath(path.relative(CONTENT_DIR, pageDir));

    return relative
    .split("/")
    .map(slugifySegment)
    .filter(Boolean)
    .join("/");
}

function urlFromSlug(slug) {
    return slug ? `/${slug}/` : "/";
}

function outputDirFromSlug(slug) {
    return slug ? path.join(DIST_DIR, slug) : DIST_DIR;
}

function hashString(value) {
    return crypto.createHash("sha1").update(value).digest("hex").slice(0, 10);
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function copyDirectoryContents(sourceDir, targetDir, options = {}) {
    const ignoredNames = new Set(options.ignoredNames ?? []);

    if (!(await pathExists(sourceDir))) {
        return;
    }

    await fs.mkdir(targetDir, { recursive: true });

    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
        if (ignoredNames.has(entry.name)) {
            continue;
        }

        const source = path.join(sourceDir, entry.name);
        const target = path.join(targetDir, entry.name);

        if (entry.isDirectory()) {
            await copyDirectoryContents(source, target, options);
        } else {
            await fs.copyFile(source, target);
        }
    }
}

function getPageKind(page) {
    return page.data.kind ?? page.data.type ?? "page";
}

function getPageRole(page) {
    return page.data.role ?? "";
}

function getPageStatus(page) {
    return page.data.status ?? "unknown";
}

function getPageTitle(page) {
    return page.data.title ?? page.slug.split("/").at(-1) ?? "Untitled";
}

function getPageDescription(page) {
    return page.data.description ?? "";
}

function makePageKey(value) {
    return String(value).toLowerCase().trim();
}

function buildNav(pages) {
    const grouped = new Map();

    for (const page of pages) {
        const section = page.slug.split("/")[0] || "home";

        if (!grouped.has(section)) {
            grouped.set(section, []);
        }

        grouped.get(section).push(page);
    }

    let html = "";

    for (const [section, sectionPages] of grouped.entries()) {
        html += `<section class="nav-section">`;
        html += `<h2>${escapeHtml(section.replaceAll("-", " "))}</h2>`;

        for (const page of sectionPages.sort((a, b) =>
            getPageTitle(a).localeCompare(getPageTitle(b))
        )) {
            html += `<a href="${urlFromSlug(page.slug)}">${escapeHtml(getPageTitle(page))}</a>`;
        }

        html += `</section>`;
    }

    return html;
}

function makeTagLinks(tags = []) {
    if (!Array.isArray(tags) || tags.length === 0) {
        return "";
    }

    return `
    <ul class="tags">
    ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
    </ul>
    `;
}

function convertWikiLinks(markdown, pagesByTitle, pagesBySlug) {
    return markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, rawTarget) => {
        const [rawPageName, rawLabel] = rawTarget.split("|");
        const pageName = rawPageName.trim();
        const label = (rawLabel ?? rawPageName).trim();

        const byTitle = pagesByTitle.get(makePageKey(pageName));
        const bySlug = pagesBySlug.get(makePageKey(pageName.replace(/^\/|\/$/g, "")));
        const target = byTitle ?? bySlug;

        if (!target) {
            return `<span class="missing-link" title="Page has not been created yet">${escapeHtml(label)}</span>`;
        }

        return `<a href="${urlFromSlug(target.slug)}">${escapeHtml(label)}</a>`;
    });
}

function renderLayout({ page, pages, contentHtml, localStyleExists }) {
    const title = getPageTitle(page);
    const kind = getPageKind(page);
    const role = getPageRole(page);
    const status = getPageStatus(page);
    const description = getPageDescription(page);
    const nav = buildNav(pages);

    const localStyleLink = localStyleExists
    ? `<link rel="stylesheet" href="./style.css?v=${page.styleHash}">`
    : "";

    const localScriptTag = page.localScriptExists
    ? `<script src="./script.js?v=${page.scriptHash}" defer></script>`
    : "";

    const extraStyles = Array.isArray(page.data.styles)
    ? page.data.styles
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n")
    : "";

    const bodyClass = [
        "wiki-page",
        `kind-${kind}`,
        role ? `role-${role}` : "",
        page.data.bodyClass ?? ""
    ]
    .filter(Boolean)
    .join(" ");

    return `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)} | Lore Wiki</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="description" content="${escapeHtml(description)}">

    <link rel="stylesheet" href="/styles/global.css">
    <link rel="stylesheet" href="/pagefind/pagefind-ui.css">
    ${localStyleLink}
    ${extraStyles}
    </head>

    <body class="${escapeHtml(bodyClass)}">
    <aside class="site-sidebar" data-pagefind-ignore>
    <a class="site-logo" href="/">
    <span class="site-logo-mark">◇</span>
    <span>Lore Wiki</span>
    </a>

    <div class="sidebar-search">
    <label for="search-input">Search records</label>
    <div id="search-input"></div>
    </div>

    <nav class="site-nav">
    ${nav}
    </nav>
    </aside>

    <main class="page-shell">
    <article class="page-card" data-pagefind-body>
    <header class="page-header">
    <p class="eyebrow">
    <span>${escapeHtml(kind)}</span>
    ${role ? `<span>${escapeHtml(role)}</span>` : ""}
    <span>${escapeHtml(status)}</span>
    </p>

    <h1>${escapeHtml(title)}</h1>

    ${
        description
        ? `<p class="page-description">${escapeHtml(description)}</p>`
        : ""
    }

    ${makeTagLinks(page.data.tags)}
    </header>

    <div class="page-content">
    ${contentHtml}
    </div>
    </article>
    </main>

    <script src="/pagefind/pagefind-ui.js"></script>
    <script src="/scripts/site.js"></script>
    ${localScriptTag}
    </body>
    </html>`;
}

function renderIndexPage(pages) {
    const sections = new Map();

    for (const page of pages) {
        const kind = getPageKind(page);

        if (!sections.has(kind)) {
            sections.set(kind, []);
        }

        sections.get(kind).push(page);
    }

    const sectionHtml = [...sections.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kind, kindPages]) => {
        return `
        <section class="index-section">
        <h2>${escapeHtml(kind)}</h2>
        <div class="index-grid">
        ${kindPages
            .sort((a, b) => getPageTitle(a).localeCompare(getPageTitle(b)))
            .map((page) => {
                return `
                <a class="index-card" href="${urlFromSlug(page.slug)}">
                <strong>${escapeHtml(getPageTitle(page))}</strong>
                <span>${escapeHtml(getPageDescription(page))}</span>
                </a>
                `;
            })
            .join("")}
            </div>
            </section>
            `;
    })
    .join("");

    return `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Wiki Index | Lore Wiki</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/styles/global.css">
    <link rel="stylesheet" href="/pagefind/pagefind-ui.css">
    </head>

    <body class="wiki-page kind-index">
    <main class="home-shell">
    <section class="home-hero" data-pagefind-body>
    <p class="eyebrow">Asymmetrical Horror Wiki</p>
    <h1>Wiki Index</h1>
    <p>
    Browse characters, killers, survivors, maps, mechanics, updates, and lore records.
    </p>

    <div id="search-input"></div>
    </section>

    ${sectionHtml}
    </main>

    <script src="/pagefind/pagefind-ui.js"></script>
    <script src="/scripts/site.js"></script>
    </body>
    </html>`;
}

async function loadPages() {
    const markdownFiles = await fg("**/index.md", {
        cwd: CONTENT_DIR,
        absolute: true,
        dot: false,
        ignore: ["**/_*/**"]
    });

    const pages = [];

    for (const file of markdownFiles) {
        const pageDir = path.dirname(file);
        const raw = await fs.readFile(file, "utf8");
        const parsed = matter(raw);

        if (parsed.data.draft === true && !SHOW_DRAFTS) {
            continue;
        }

        const slug = slugFromContentDir(pageDir);

        const localStylePath = path.join(pageDir, "style.css");
        const localScriptPath = path.join(pageDir, "script.js");

        const localStyleExists = await pathExists(localStylePath);
        const localScriptExists = await pathExists(localScriptPath);

        const styleHash = localStyleExists
        ? hashString(await fs.readFile(localStylePath, "utf8"))
        : "";

        const scriptHash = localScriptExists
        ? hashString(await fs.readFile(localScriptPath, "utf8"))
        : "";

        pages.push({
            file,
            pageDir,
            slug,
            data: parsed.data,
            markdown: parsed.content,
            localStyleExists,
            localScriptExists,
            styleHash,
            scriptHash
        });
    }

    return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

async function build() {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
    await fs.mkdir(DIST_DIR, { recursive: true });

    await copyDirectoryContents(PUBLIC_DIR, DIST_DIR);

    const pages = await loadPages();

    const pagesByTitle = new Map();
    const pagesBySlug = new Map();

    for (const page of pages) {
        pagesByTitle.set(makePageKey(getPageTitle(page)), page);
        pagesBySlug.set(makePageKey(page.slug), page);
    }

    for (const page of pages) {
        const outDir = outputDirFromSlug(page.slug);
        await fs.mkdir(outDir, { recursive: true });

        await copyDirectoryContents(page.pageDir, outDir, {
            ignoredNames: ["index.md"]
        });

        const linkedMarkdown = convertWikiLinks(page.markdown, pagesByTitle, pagesBySlug);
        const contentHtml = marked(linkedMarkdown);

        const html = renderLayout({
            page,
            pages,
            contentHtml,
            localStyleExists: page.localStyleExists
        });

        await fs.writeFile(path.join(outDir, "index.html"), html);
    }

    const indexHtml = renderIndexPage(pages);
    await fs.writeFile(path.join(DIST_DIR, "index.html"), indexHtml);

    const wikiIndexDir = path.join(DIST_DIR, "wiki-index");
    await fs.mkdir(wikiIndexDir, { recursive: true });
    await fs.writeFile(path.join(wikiIndexDir, "index.html"), renderIndexPage(pages));

    console.log(`Built ${pages.length} page(s).`);
}

build().catch((error) => {
    console.error(error);
    process.exit(1);
});
