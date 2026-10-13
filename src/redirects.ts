/**
 * Legacy GitBook → new docs redirect rules.
 *
 * The three old GitBook domains are forwarded by Squarespace Domain
 * Forwarding (301, "Maintain paths"):
 *
 *   docs.ovenmediaengine.com/*            → ovenmedia.com/docs/ome/*
 *   docs.enterprise.ovenmediaengine.com/* → ovenmedia.com/docs/ome-enterprise/*
 *   docs.ovenplayer.com/*                 → ovenmedia.com/docs/ovenplayer/*
 *
 * Squarespace appends the original path verbatim, so GitBook's
 * version / locale / "guide" path segments survive the forward and
 * land on paths that don't exist on the new flat single-version site:
 *
 *   /docs/ome/0.18.0/configuration/x          (version prefix)
 *   /docs/ome-enterprise/guide/features/x     ("guide" space prefix)
 *   /docs/ome-enterprise/guide/ko-kr/x        (Korean locale, discontinued)
 *   /docs/ovenplayer/v0.9.x/x                 (version prefix)
 *
 * `createDocsRedirects` regenerates those legacy path variants for
 * every current route, so @docusaurus/plugin-client-redirects emits a
 * static stub that 301s each one to the live page. Policy (confirmed):
 * old versions and Korean both collapse onto the current English page.
 *
 * Sitemap analysis of all 922 indexed legacy URLs: 246 unique targets,
 * 243 covered by these rules; the remaining 3 are genuine renames /
 * removals handled explicitly in `explicitRedirects` below.
 */

// OME GitBook sub-sitemap version trees (plus the unprefixed "latest",
// which Squarespace already lands correctly and needs no stub). `dev`
// is the unreleased-docs tree.
export const OME_VERSIONS = [
  'dev',
  '0.20.0',
  '0.19.0',
  '0.18.0',
  '0.17.3',
  '0.17.2',
  '0.17.1',
  '0.16.8',
  '0.16.6',
];

// OvenPlayer GitBook had a single archived version tree besides latest.
export const OVENPLAYER_VERSIONS = ['v0.9.x'];

/** Strip a `/docs/<base>` prefix; returns the remaining slug or '' for the base itself. */
function restAfter(existingPath: string, base: string): string | null {
  if (existingPath === base) return '';
  if (existingPath.startsWith(base + '/')) return existingPath.slice(base.length + 1);
  return null;
}

const join = (base: string, rest: string) => (rest ? `${base}/${rest}` : base);

/**
 * For a given current route, return every legacy path (as the browser
 * sees it after Squarespace forwarding) that should 301 here.
 * Called by plugin-client-redirects for all routes; returns undefined
 * for non-docs routes (home, blog, marketing pages).
 */
export function createDocsRedirects(existingPath: string): string[] | undefined {
  // Order matters: check the longer `ome-enterprise` base before `ome`.
  let rest = restAfter(existingPath, '/docs/ome-enterprise');
  if (rest !== null) {
    const guide = join('/docs/ome-enterprise/guide', rest);
    const guideKo = join('/docs/ome-enterprise/guide/ko-kr', rest);
    return [guide, guideKo];
  }

  rest = restAfter(existingPath, '/docs/ome');
  if (rest !== null) {
    return OME_VERSIONS.map((v) => join(`/docs/ome/${v}`, rest as string));
  }

  rest = restAfter(existingPath, '/docs/ovenplayer');
  if (rest !== null) {
    return OVENPLAYER_VERSIONS.map((v) => join(`/docs/ovenplayer/${v}`, rest as string));
  }

  return undefined;
}

/**
 * The 3 legacy pages that renaming/removal makes unreachable by the
 * rules above. `from` is the post-forwarding path on this site.
 */
export const explicitRedirects: {from: string[]; to: string}[] = [
  {
    from: [
      '/ome',
      '/ovenmediaengine',
      '/ome-enterprise',
      '/ovenmediaengineenterprise',
      '/ome-aws',
      '/ovenmediaengine-enterprise',
      '/ovenmediaengine-aws',
    ],
    to: '/',
  },
  {
    from: ['/ovenmediaengine-cloud', '/ome-cloud', '/omc', '/ovenmedia-cloud'],
    to: '/om-cloud',
  },
  {
    // GitBook "transcoding" section had an overview child also named
    // "transcoding"; the new site flattened it into the section page.
    from: [
      '/docs/ome/transcoding/transcoding',
      ...OME_VERSIONS.map((v) => `/docs/ome/${v}/transcoding/transcoding`),
    ],
    to: '/docs/ome/transcoding',
  },
  {
    // Old Enterprise "Exclusive Feature Index" landing → its successor.
    from: [
      '/docs/ome-enterprise/guide/exclusive/exclusive-feature-index',
      '/docs/ome-enterprise/guide/ko-kr/exclusive/exclusive-feature-index',
    ],
    to: '/docs/ome-enterprise/about/feature-index',
  },
  {
    // Korean-only subpage with no English equivalent → its parent.
    from: [
      '/docs/ome-enterprise/guide/ko-kr/exclusive/web-console/web-console-overview/event-monitoring/event-configuration',
    ],
    to: '/docs/ome-enterprise/exclusive/web-console/web-console-overview/event-monitoring',
  },
];
