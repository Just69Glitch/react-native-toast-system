const path = require("node:path");
const webpack = require("webpack");

const searchByWorkerModulePath = require.resolve(
  "@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker.js"
);
const searchThemeDir = path.dirname(searchByWorkerModulePath).replace(/\\/g, "/");

module.exports = function searchBehaviorOverridePlugin() {
  return {
    name: "search-behavior-override",
    configureWebpack() {
      return {
        plugins: [
          new webpack.NormalModuleReplacementPlugin(
            /searchByWorker$/,
            (resource) => {
              const context = (resource.context || "").replace(/\\/g, "/");
              if (context.startsWith(searchThemeDir)) {
                resource.request = path.resolve(
                  __dirname,
                  "../src/search/searchByWorker.custom.js"
                );
              }
            }
          ),
        ],
      };
    },
  };
};
