exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // Optional for disk-constrained builds; normal builds retain incremental caching.
  if (process.env.VATA_BUILD_NO_CACHE === "1") {
    actions.setWebpackConfig({ cache: false })
  }
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [{ test: /maplibre-gl/, use: loaders.null() }],
      },
    })
  }
}
