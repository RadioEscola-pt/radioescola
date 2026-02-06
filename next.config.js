// MDX config with frontmatter + GFM (Webpack dev friendly)
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [["remark-gfm"], ["remark-frontmatter"]],
    rehypePlugins: [],
  },
});

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

module.exports = withNextIntl(withMDX(nextConfig));
