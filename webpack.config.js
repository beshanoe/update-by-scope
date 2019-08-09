module.exports = {
  mode: "production",
  entry: "./src/index.js",
  target: "node",
  output: {
    path: __dirname + "/cli",
    filename: "index.js"
  }
};
