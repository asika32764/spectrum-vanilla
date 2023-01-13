const webpack = require('webpack');
const path = require('path');

const libraryTarget = process.env.LIB_TARGET || 'umd';
let output = 'spectrum.js';

if (process.env.NODE_ENV === 'production') {
  if (libraryTarget === 'umd') {
    output = 'spectrum.min.js';
  } else {
    output = 'spectrum.common.js';
  }
} else {
  if (libraryTarget === 'umd') {
    output = 'spectrum.js';
  } else {
    output = 'spectrum.common.js';
  }
}

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: "./src/index.ts",
  output: {
    path: path.resolve('./dist'),
    filename: output,
    libraryTarget,
    library: ['Spectrum'],
    sourceMapFilename: "spectrum.js.map"
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /(node_modules|bower_components)/,
        options:{}
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: 'last 3 version, safari 10, ie 11, not dead',
                  modules: false
                }
              ],
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining',
            ]
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};

module.exports = config;
