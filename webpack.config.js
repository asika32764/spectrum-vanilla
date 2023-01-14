const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const libraryTarget = process.env.LIB_TARGET || 'umd';
let output = 'spectrum';

if (libraryTarget === 'module') {
  output += '.es';
}

if (process.env.NODE_ENV === 'production') {
  output += '.min';
}

output += '.js';

const library = libraryTarget === 'module'
  ? {
    type: libraryTarget,
  }
  : {
    name: 'Spectrum',
    type: libraryTarget,
    export: "default",
  };

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: "./src/index.ts",
  output: {
    path: path.resolve('./dist'),
    filename: output,
    library,
    globalObject: 'this',
    sourceMapFilename: "[base].map",
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      "@": path.resolve(__dirname, './src/')
    }
  },
  optimization: {
    usedExports: true,
    // concatenateModules: true,
    // minimize: true,
  },
  experiments: {
    outputModule: libraryTarget === 'module'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
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
                    targets: '> 0.5%, last 3 versions, not dead',
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
  ]
};

module.exports = config;
