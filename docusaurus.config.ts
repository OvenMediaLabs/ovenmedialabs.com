import {themes as prismThemes, type PrismTheme} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {sectionHeaderSidebarGenerator} from './src/lib/sidebar-section-headers';
import {createDocsRedirects, explicitRedirects} from './src/redirects';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultOgImage = require('./plugins/default-og-image.js');

/**
 * Custom Prism theme: low-saturation, brand-aligned, easy on the eyes.
 *
 * Built-in dark themes (oneDark / nightOwl / vsDark) are tuned for IDE
 * use and lean on vivid coral / purple / electric blue. In long-form
 * docs that becomes visual fatigue. This palette caps at five hues,
 * all desaturated, drawn from the OvenMedia Labs brand palette:
 *
 *   #7DD3FC  light sky   tag name, function/class, attr-value
 *                        (the "name / pointer" tokens)
 *   #C5A38E  warm tan    attr-name, number, boolean
 *                        (the "label / literal" tokens)
 *   #38BDF8  brand sky   keyword, builtin
 *                        (the single saturated accent — only for actual
 *                         language keywords, which are rare in XML)
 *   #6E7681  dim gray    comment (italic), punctuation, operator
 *                        (the "scaffolding" tokens that should recede)
 *   #D4D4D4  default     plain text content, strings, variables
 *
 * Earlier revisions chose four near-identical grays (`#9BA4B4`, `#8B949E`,
 * `#C9D1D9`, `#6E7681`) for tags / punctuation / default / comment, and
 * the result rendered as a single washed-out gray block. The fix: tags
 * (the most important XML token) get the visible light-sky, not yet
 * another shade of gray. */
const omeCodeTheme: PrismTheme = {
  plain: {
    color: '#d4d4d4',
    backgroundColor: '#0d1117',
  },
  styles: [
    {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#6e7681', fontStyle: 'italic'}},
    {types: ['punctuation', 'operator', 'entity', 'url'], style: {color: '#6e7681'}},
    {types: ['tag', 'namespace', 'selector'], style: {color: '#7dd3fc'}},
    {types: ['attr-name'], style: {color: '#c5a38e'}},
    {types: ['string', 'attr-value', 'char', 'regex'], style: {color: '#9ba4b4'}},
    {types: ['number', 'boolean', 'constant', 'symbol'], style: {color: '#c5a38e'}},
    {types: ['keyword', 'builtin', 'rule', 'important'], style: {color: '#38bdf8'}},
    {types: ['function', 'method', 'class-name'], style: {color: '#7dd3fc'}},
    {types: ['variable', 'parameter', 'property'], style: {color: '#d4d4d4'}},
    {types: ['deleted'], style: {color: '#ff9999'}},
    {types: ['inserted'], style: {color: '#9bd99b'}},
  ],
};

// When upstream editors run `docs-site/preview.sh`, the script starts
// the site with OML_PREVIEW_SOURCE=ome|ome-enterprise|ovenplayer. That
// switches the site into "docs-only" mode: marketing nav/footer items
// are hidden, and `/` redirects to `/docs/<source>/`. The rest of the
// site stays reachable by direct URL so nothing actually breaks — the
// editor just never sees marketing chrome while previewing docs.
const PREVIEW_SOURCE = process.env.OML_PREVIEW_SOURCE || '';

// Site-wide structured data. Organization establishes the entity
// ("OvenMedia Labs, formerly AirenSoft, makes OvenMediaEngine") for
// Google's knowledge graph and AI answer engines; WebSite wires the
// in-site search box into the sitelinks search action. Page-type
// schema (BreadcrumbList on docs, BlogPosting on posts) is emitted
// automatically by Docusaurus; SoftwareApplication for the products
// lives in the respective marketing pages.
const SITE_URL = 'https://ovenmedia.com';
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'OvenMedia Labs',
      alternateName: 'AirenSoft',
      url: SITE_URL,
      logo: `${SITE_URL}/images/ico/web-app-manifest-512x512.png`,
      description:
        'Media Technology Experts Group. Developers of OvenMediaEngine and OvenMediaEngine Enterprise.',
      foundingDate: '2010',
      sameAs: [
        'https://github.com/OvenMediaLabs',
        'https://www.linkedin.com/company/ovenmedialabs',
        'https://x.com/OvenMediaEngine',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'OvenMedia Labs',
      description:
        'Sub-second latency live streaming, powered by OvenMediaEngine.',
      publisher: {'@id': `${SITE_URL}/#organization`},
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

const config: Config = {
  title: 'OvenMedia Labs',
  tagline: 'Sub-second latency live streaming, powered by OvenMediaEngine.',
  favicon: 'images/ico/favicon.ico',

  customFields: {
    previewSource: PREVIEW_SOURCE,
  },

  future: {
    v4: true,
    faster: true,
  },

  url: 'https://ovenmedia.com',
  baseUrl: '/',

  organizationName: 'OvenMediaLabs',
  projectName: 'ovenmedialabs.com',
  trailingSlash: false,

  // Build fails on any broken link / anchor / markdown image. Caught
  // every existing case during the migration; new ones should surface
  // immediately in CI rather than rot.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  clientModules: [
    './src/clientModules/bootstrap-dark.ts',
    './src/clientModules/legacy-marketing.ts',
    './src/clientModules/mobile-scroll.ts',
    './src/clientModules/preview-redirect.ts',
    './src/clientModules/gtag-stub.ts',
    // Dev-only review-comment overlay; excluded from production builds.
    ...(process.env.NODE_ENV === 'development'
      ? ['./src/clientModules/review-comments.ts']
      : []),
  ],

  headTags: [
    // ----- Favicon -----
    { tagName: 'link', attributes: { rel: 'icon', type: 'image/svg+xml', href: '/images/ico/favicon.svg' } },
    { tagName: 'link', attributes: { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/images/ico/favicon-96x96.png' } },
    { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/ico/apple-touch-icon.png' } },
    { tagName: 'link', attributes: { rel: 'manifest', href: '/images/ico/site.webmanifest' } },
    // ----- Consent (production only) -----
    // Google Consent Mode defaults must run BEFORE GTM/GA4/Ads fire.
    // GTM → @docusaurus/plugin-google-tag-manager
    // GA4 + Google Ads → @docusaurus/plugin-google-gtag
    // Both plugins hook into Docusaurus routing and track SPA navigation.
    ...(process.env.NODE_ENV === 'production' ? [
      {
        tagName: 'script' as const,
        attributes: {'data-cookieconsent': 'ignore'},
        innerHTML:
          "window.dataLayer=window.dataLayer||[];" +
          "window.gtag=function(){dataLayer.push(arguments);};" +
          "gtag('consent','default',{" +
            "ad_personalization:'denied'," +
            "ad_storage:'denied'," +
            "ad_user_data:'denied'," +
            "analytics_storage:'denied'," +
            "functionality_storage:'denied'," +
            "personalization_storage:'denied'," +
            "security_storage:'granted'," +
            "wait_for_update:500" +
          "});" +
          "gtag('set','ads_data_redaction',true);" +
          "gtag('set','url_passthrough',false);",
      },
      {
        tagName: 'script' as const,
        attributes: {
          id: 'Cookiebot',
          src: 'https://consent.cookiebot.com/uc.js',
          'data-cbid': 'dcd64d7e-3ca2-4039-8c6c-759a3286d6e9',
          'data-blockingmode': 'auto',
          type: 'text/javascript',
          async: 'true',
        },
      },
    ] : []),

    {
      // Site-wide Organization + WebSite JSON-LD. Emitted on every
      // page (incl. preview/CI builds) — structured data is not
      // tracking and should always be present.
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify(structuredData),
    },

    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
      },
    },
    {
      // Inline script ensures Bootstrap's data-bs-theme attribute is set
      // synchronously, before first paint, to avoid a flash of light theme.
      tagName: 'script',
      attributes: {},
      innerHTML: "document.documentElement.setAttribute('data-bs-theme','dark');",
    },
    {
      tagName: 'script',
      attributes: {
        src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
        defer: 'true',
      },
    },
    {
      tagName: 'script',
      attributes: {
        src: 'https://unpkg.com/@phosphor-icons/web',
        defer: 'true',
      },
    },
    // The legacy /assets/js/main.js is intentionally NOT loaded here. Its
    // logic has been ported to src/clientModules/legacy-marketing.ts which
    // re-runs on every SPA route change and null-guards every DOM lookup.
  ],

  presets: [
    [
      'classic',
      {
        // Disable the default docs instance — we register three named
        // instances under `plugins` below (ome / ome-enterprise / ovenplayer)
        // so each product has its own sidebar and route base path.
        docs: false,
        blog: {
          showReadingTime: true,
          routeBasePath: 'blog',
          // We render our own list view (see swizzled BlogPostItem) and
          // a TOC + author card on the right column of post pages, so
          // the default left-column "Recent posts" sidebar would just
          // duplicate the main list / clutter the read view. Setting
          // count to 0 disables the sidebar entirely instead of hiding
          // it with CSS after the fact.
          blogSidebarCount: 0,
          // Keep Docusaurus's default `GlobExcludeDefault` patterns
          // (which skip `_*` files/folders, hence `_template/`) and add
          // `README.md` so the contributor guide colocated with posts
          // doesn't get rendered as a post itself.
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            'README.md',
          ],
          blogTitle: 'OvenMedia Blog',
          blogDescription: 'Sub-second latency live streaming insights from OvenMedia Labs.',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'OvenMedia Blog',
            description: 'Sub-second latency live streaming insights from OvenMedia Labs.',
          },
          // editUrl intentionally omitted: editors and contributors don't
          // need a per-post "Edit this page" link on the live blog. The
          // GitHub source is one click away from the footer for the rare
          // case someone wants to open a PR.
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          // Order matters: custom.css first (Infima token overrides), legacy
          // marketing CSS second so its rules win over both Infima and
          // Bootstrap on shared selectors.
          customCss: ['./src/css/custom.css', './src/css/legacy-marketing.css'],
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
          // Keep the sitemap to real, indexable destinations. The
          // /search and /404 utility routes must never be listed; the
          // blog tag / author / archive / paginated listing pages are
          // thin index pages that dilute crawl focus and don't deserve
          // their own search result. Canonical content (marketing
          // pages, docs, individual blog posts) stays in.
          ignorePatterns: [
            '/search',
            '/404',
            '/ome',
            '/ome-enterprise',
            '/blog/archive',
            '/blog/tags/**',
            '/blog/authors/**',
            '/**/page/**',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // ----- Analytics (production only) -----
    ...(process.env.NODE_ENV === 'production' ? [
      ['@docusaurus/plugin-google-tag-manager', {containerId: 'GTM-THBJMSZV'}],
      ['@docusaurus/plugin-google-gtag', {
        trackingID: ['G-YF1TS3WD9S', 'AW-955539851'],
      }],
    ] as any[] : []),
    // Expand `dup:` Enterprise stubs from the OSS manual at plugin
    // module-load — before any plugin's loadContent (incl.
    // @docusaurus/plugin-content-docs) and on BOTH `docusaurus build`
    // and `docusaurus start`, so shared pages are filled for the
    // published site, CI checks, and local preview alike.
    './plugins/gen-enterprise-shared-plugin.js',
    // Click an image to magnify it in place. The dashboard screenshots in the
    // blog are 1200-3100px wide and render at about a quarter of that in the
    // content column, which leaves panel labels unreadable without a zoom.
    'docusaurus-plugin-image-zoom',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ome',
        path: 'docs/ome',
        routeBasePath: 'docs/ome',
        sidebarPath: './sidebars-ome.ts',
        sidebarItemsGenerator: sectionHeaderSidebarGenerator,
        remarkPlugins: [[defaultOgImage, {image: 'images/og/og_ome.png'}]],
        // README.md is the contributor authoring guide; it ships in the
        // upstream docs/ tree but must not appear in the public sidebar.
        exclude: ['README.md'],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ome-enterprise',
        path: 'docs/ome-enterprise',
        routeBasePath: 'docs/ome-enterprise',
        sidebarPath: './sidebars-ome-enterprise.ts',
        sidebarItemsGenerator: sectionHeaderSidebarGenerator,
        remarkPlugins: [[defaultOgImage, {image: 'images/og/og_ome-enterprise.png'}]],
        exclude: ['README.md'],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ovenplayer',
        path: 'docs/ovenplayer',
        routeBasePath: 'docs/ovenplayer',
        sidebarPath: './sidebars-ovenplayer.ts',
        sidebarItemsGenerator: sectionHeaderSidebarGenerator,
        remarkPlugins: [[defaultOgImage, {image: 'images/og/og_op.png'}]],
        exclude: ['README.md'],
      },
    ],
    // Legacy GitBook → new docs 301s. Squarespace forwards the three
    // old domains here (Maintain paths), carrying GitBook's version /
    // locale / "guide" path segments; this generates a static stub for
    // each legacy path variant that redirects to the live page. Rules
    // and the 3 explicit renames live in src/redirects.ts.
    [
      '@docusaurus/plugin-client-redirects',
      {
        createRedirects: createDocsRedirects,
        redirects: explicitRedirects,
      },
    ],
    // Client-side search. Indexes docs + blog at build time, ships the
    // index as JSON in the bundle, runs in-browser. No external service
    // (Algolia, Typesense). Plugin injects a SearchBar into the navbar
    // and a `/search` results page automatically.
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,                  // hash the index file for cache busting
        indexDocs: true,
        indexBlog: true,
        indexPages: true,              // include marketing pages so /ome, /company, etc. surface in search
        language: ['en', 'ko'],
        // ⌘K / Ctrl+K shortcut: the modern docs-site pattern is to
        // jump focus to the search input from anywhere on the page,
        // with a visible <kbd> hint in the bar. We don't want either
        // — Bootstrap navbar layout doesn't have room for the hint
        // pill, and the shortcut is unfamiliar to non-power users.
        searchBarShortcut: false,
        docsRouteBasePath: ['/docs/ome', '/docs/ome-enterprise', '/docs/ovenplayer'],
        // We register three plugin-content-docs instances (ome / ome-enterprise
        // / ovenplayer) with no `default` instance — the SearchBar's
        // `useActiveVersion` call fails without an explicit pick. Point it
        // at `ome` (the open-source flagship); the search index still
        // covers all three products via `docsRouteBasePath` above.
        docsPluginIdForPreferredVersion: 'ome',
        // Do NOT use `searchContextByPaths`. The plugin auto-detects
        // the current page's path (e.g. `/docs/ome/...`) and silently
        // scopes search to that context, hiding blog and marketing
        // pages — even with `useAllContextsWithNoSearchContext: true`
        // (that flag only fires when the page lives outside every
        // configured context, which is rare in our setup). Source
        // labeling for results is handled instead by
        // `scripts/label-search-results.js`, which prepends the
        // product name to each indexed document's breadcrumb.
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
    // Local build hook: regenerate src/data/blog-index.json from blog/
    // frontmatter before bundling (loadContent), so "From the Labs" and
    // related-posts always reflect the latest published posts. Search
    // index labeling can't run here (the index isn't written until
    // after plugin postBuild) — it's the npm `postbuild` script
    // instead. See the plugin file for the full rationale.
    './plugins/oml-build-hooks.js',
  ],

  themeConfig: {
    zoom: {
      selector: '.markdown img',
      background: {light: 'rgba(255, 255, 255, 0.95)', dark: 'rgba(2, 12, 27, 0.95)'},
      config: {margin: 24},
    },
    image: 'images/og/og_oml.png',
    mermaid: {
      // `neutral` theme — monochrome, modern, no lavender/yellow.
      // The SVG bg is transparent, but every diagram is wrapped in a
      // `.docusaurus-mermaid-container` white card (see custom.css) so
      // the dark text stays legible on the dark site.
      theme: {light: 'neutral', dark: 'neutral'},
      options: {
        // Wrap long note text instead of clipping it past the
        // measured box width (Mermaid's default sizing under-measures
        // when text contains parentheses/punctuation).
        sequence: {wrap: true},
      },
    },
    metadata: [
      {name: 'keywords', content: 'ovenmedia, oven media, ovenmedia labs, airensoft, ovenmediaengine, ome, ome enterprise, ovenplayer, ovenlivekit, sub second latency streaming, webrtc streaming, llhls streaming, srt streaming, open source streaming server'},
      {property: 'og:site_name', content: 'OvenMedia Labs'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@OvenMediaEngine'},
    ],
    colorMode: {
      defaultMode: 'dark',
      // The site renders dark-mode-only — Bootstrap's data-bs-theme is
      // pinned to "dark" via headTags and an inline pre-paint script,
      // independent of Docusaurus's color mode. Exposing a toggle leaves
      // the page in an inconsistent half-light state on click, so hide it.
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'OvenMedia Labs',
        src: 'images/airen_ci/OML_horz_right_default.svg',
        href: '/',
      },
      items: [
        {to: '/', label: 'OvenMediaEngine', position: 'left'},
        {to: '/om-cloud', label: 'OvenMedia Cloud', position: 'left'},
        {
          // The swizzled NavbarContent recognizes `customMenu: 'resources'`
          // and renders items from src/config/navbarResources.ts (which
          // contains divider/header entries that Docusaurus's themeConfig
          // schema rejects). The empty `items` array satisfies the schema.
          label: 'Resources',
          position: 'left',
          customMenu: 'resources',
          items: [],
        } as any,
        {to: '/company', label: 'Company', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {label: 'OvenMediaEngine Enterprise', to: '/'},
            {label: 'OvenMediaEngine', href: 'https://github.com/AirenSoft/OvenMediaEngine'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'OvenMediaEngine Guide', to: '/docs/ome'},
            {label: 'OvenMediaEngine Enterprise Guide', to: '/docs/ome-enterprise'},
            {label: 'OvenPlayer Guide', to: '/docs/ovenplayer'},
            {label: 'Blog', to: '/blog'},
            {label: 'GitHub', href: 'https://github.com/AirenSoft'},
            {label: 'Community Discussions', href: 'https://github.com/AirenSoft/OvenMediaEngine/discussions'},
          ],
        },
        {
          title: 'Company',
          items: [
            {label: 'About', to: '/company'},
            {label: 'Contact', to: '/company#contact'},
            {label: 'AGPLv3', to: '/agplv3'},
            {label: 'EULA', to: '/eula'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OvenMedia Labs (Formerly AirenSoft). All rights reserved.`,
    },
    prism: {
      // Custom theme — see `omeCodeTheme` above this config block.
      // Built-in dark themes (oneDark / nightOwl / vsDark) tested and
      // all failed the eye-strain bar: too vivid, too many hues.
      theme: omeCodeTheme,
      darkTheme: omeCodeTheme,
      additionalLanguages: ['bash', 'json', 'yaml', 'markup', 'docker', 'nginx', 'go', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
