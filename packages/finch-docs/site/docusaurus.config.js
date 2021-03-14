module.exports = {
  title: "Finch GraphQL",
  tagline: "Communication for modern extensions",
  url: "https://finch-graphql.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "jointoucan", // Usually your GitHub org/user name.
  projectName: "finch-graphql", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Finch GraphQL",
      logo: {
        alt: "Finch",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          href: "https://github.com/jointoucan/finch-graphql",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Concepts",
              to: "/docs/how-it-works",
            },
            {
              label: "Setup API",
              to: "/docs/",
            },
            {
              label: "Setup client",
              to: "/docs/client-setup",
            },
          ],
        },
        {
          title: "Integrations",
          items: [
            {
              label: "Devtools",
              to: "/docs/devtools",
            },
            {
              label: "Typescript codegen",
              to: "/docs/typescript-codegen",
            },
          ],
        },
        {
          title: "Examples",
          items: [
            {
              label: "Finch Bookmarks",
              to: "https://github.com/jcblw/finch-bookmarks",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Toucan, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/jointoucan/finch-graphql/edit/master/website/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
