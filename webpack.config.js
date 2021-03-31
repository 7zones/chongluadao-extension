const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    background: './build/js/background.js',
    blocking: './build/js/blocking.js',
    features: './build/js/features.js',
    plugin_ui: './build/js/plugin_ui.js',
    rating: './build/js/rating.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/js/')
  }
};
