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
    library: {
      name: 'Spectrum',
      type: libraryTarget,
      export: "default",
    },
    globalObject: 'this',
    sourceMapFilename: "spectrum.js.map",
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  optimization: {
    usedExports: true,
    // concatenateModules: true,
    // minimize: true,
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
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                // [
                //   '@babel/preset-typescript'
                // ],
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
          },
          'ts-loader'
        ],
        // exclude: /(node_modules|bower_components)/,
        // options:{}
      }
    ]
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    //   }
    // })
  ]
};

module.exports = config;
