const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './frontend-js/main.js',  // where our desired js files live. 
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')  // where to export js files
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',   // babel helps to convert ultra modern js code into js that will be supported by every browser.
          options: {
            presets: ['@babel/preset-env']
          }
        }
      } 
    ]
  }
}