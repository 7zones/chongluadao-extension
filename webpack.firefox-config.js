const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: './build-firefox/js/background.js',
    blocking: './build-firefox/js/blocking.js',
    features: './build-firefox/js/features.js',
    plugin_ui: './build-firefox/js/plugin_ui.js',
    rating: './build-firefox/js/rating.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build-firefox/js/')
  },
  plugins: [
    new webpack.DefinePlugin({
      'chrome.extension': 'browser.runtime',
      'chrome': 'browser',
    }),
  ]
};
