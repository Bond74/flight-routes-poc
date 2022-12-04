const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  mode: "none",
  entry: slsw.lib.entries,
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js"
  },
  target: "node",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
