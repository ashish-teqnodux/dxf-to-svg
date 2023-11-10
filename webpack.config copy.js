const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')

const rootDir = path.join(__dirname, '.')

const config = {
  entry: {
    app: path.join(rootDir, './index.jsx'),
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(rootDir, './public/index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new Dotenv(),
  ],
  module: {
    strictExportPresence: false,
    rules: [
      {
        test: /\.(txt|md|blob)$/i,
        use: 'raw-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: '@svgr/webpack',
            options: {
              babel: false,
              icon: true,
            },
          },
        ],
      },
      {
        test: /\.(jsx|js|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|gif|jpe?g|PNG|JPE?G)$/,
        loader: 'url-loader',
        options: { limit: false },
      },
      {
        test: /\.gltf$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map'
    config.devServer = {
      server: 'http',
      compress: true,
      static: {
        directory: path.join(rootDir, './public'),
        staticOptions: {
          maxAge: 3600000 // ms
        }
      },
      client: {
        overlay: false,
      },
      port: process.env.PORT,
      historyApiFallback: true,
    }
  }
  return config
};