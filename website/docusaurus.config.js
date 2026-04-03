// @ts-check
const { themes } = require("prism-react-renderer");

const searchPlugins = [
  [
    require.resolve("@easyops-cn/docusaurus-search-local"),
    {
      indexDocs: true,
      indexBlog: false,
      indexPages: true,
      hashed: true,
      language: ["en"],
      docsRouteBasePath: "/docs",
      docsDir: ["../docs", "versioned_docs"],
      removeDefaultStopWordFilter: true,
      removeDefaultStemmer: true,
      fuzzyMatchingDistance: 2,
      searchResultLimits: 10,
      searchResultContextMaxLength: 50,
      explicitSearchResultPath: true,
      highlightSearchTermsOnTargetPage: true,
    },
  ],
  require.resolve("./plugins/search-behavior-override"),
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "react-native-toast-system",
  tagline: "Production-grade React Native toast system docs",
  url: "https://just69glitch.github.io",
  baseUrl: "/react-native-toast-system/",
  favicon: "img/branding/logo.ico",
  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  organizationName: "Just69Glitch",
  projectName: "react-native-toast-system",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../docs",
          routeBasePath: "docs",
          includeCurrentVersion: true,
          versions: {
            current: {
              label: "Next",
              path: "next",
            },
          },
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/Just69Glitch/react-native-toast-system/tree/main",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  plugins: searchPlugins,

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/branding/logo.png",
      colorMode: {
        defaultMode: "light",
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "react-native-toast-system",
        logo: {
          alt: "react-native-toast-system",
          src: "img/branding/logo.png",
          srcDark: "img/branding/logo.png",
          width: 32,
          height: 32,
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "docsSidebar",
            position: "left",
            label: "Docs",
          },
          {
            type: "docsVersionDropdown",
            position: "left",
            dropdownActiveClassDisabled: true,
          },
          {
            type: "search",
            position: "right",
          },
          {
            href: "https://github.com/Just69Glitch/react-native-toast-system",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Getting Started",
                to: "/docs/getting-started",
              },
              {
                label: "API Reference",
                to: "/docs/api-reference",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Issues",
                href: "https://github.com/Just69Glitch/react-native-toast-system/issues",
              },
            ],
          },
        ],
        copyright: `Copyright (c) ${new Date().getFullYear()} react-native-toast-system contributors`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
