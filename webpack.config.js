module.exports = {
  mode: "development",
  devtool: false,
  entry: "./src/index.js",
  target: "node",
  output: {
    path: __dirname + "/cli",
    filename: "index.js"
  }
};
