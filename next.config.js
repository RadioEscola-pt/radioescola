// MDX config with frontmatter + GFM + math (Webpack dev friendly)
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [["remark-gfm"], ["remark-frontmatter"], ["remark-math"]],
    rehypePlugins: [["rehype-katex"]],
  },
});

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "standalone",
  // Two API routes read source files off disk at request time with paths built
  // from process.cwd(), which file tracing cannot follow. Without these the
  // standalone bundle ships without them and both routes answer empty.
  outputFileTracingIncludes: {
    "/api/notes/\\[category\\]/\\[id\\]": ["content/notes/**/*.mdx"],
    "/api/study-items": ["app/aprender/**/page.mdx"],
  },
  // Ephemeral Cloudflare tunnels (bun run tunnel) serve the dev server from a
  // random *.trycloudflare.com host; Next blocks cross-origin dev assets otherwise.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // /study/* was the public home of the guides until they moved to /aprender/*.
  // The old paths are in the wild — indexed, bookmarked, linked from the
  // Telegram group — so they redirect permanently rather than 404.
  async redirects() {
    return [
      { source: "/study", destination: "/aprender", permanent: true },
      { source: "/study/:slug*", destination: "/aprender/:slug*", permanent: true },
    ];
  },
};

module.exports = withNextIntl(withMDX(nextConfig));
