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
};

module.exports = withNextIntl(withMDX(nextConfig));
