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
    "/api/study-items": ["app/study/**/page.mdx"],
  },
  // Ephemeral Cloudflare tunnels (bun run tunnel) serve the dev server from a
  // random *.trycloudflare.com host; Next blocks cross-origin dev assets otherwise.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

module.exports = withNextIntl(withMDX(nextConfig));
