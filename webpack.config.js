const path = require('path')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')
const ExtractPlugin = require('extract-text-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config = {
  target: 'web',
  entry: path.join(__dirname, 'src/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.jsx$/,
      loader: 'babel-loader'
    }, {
      test: /\.(png|jpeg|gif|jpg|svg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: '[name]-test.[ext]'
        }
      }]
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      // 1. 给webpack在编译的过程当中以及写js代码的时候去判断这个环境都可以使用process.env.NODE_ENV
      // 2. vue和react等框架代码会根据不同的环境去区分打包，在开发环境是一个很大的版本包好错误提醒等，但是这些在正式环境是不需要的，所以要使用这个变量进行区分。
      'process.env': {
        NODE_ENV: isDev ? '"development"' : '"production"'
      }
    }),
    new HTMLPlugin()
  ]
}

if (isDev) {
  config.devtool = '#cheap-module-eval-source-map'
  config.module.rules.push({
    test: /\.styl$/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        }
      },
      'stylus-loader'
    ]
  }),
  config.devServer = {
    port: 8000,
    host: '0.0.0.0',
    overlay: {
      errors: true,
    },
    open: true,
    hot: true
  },
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
} else {
  config.entry = {
    app: path.join(__dirname, 'src/index.js'),
    vendor: ['vue']
  }
  config.output.filename = '[name].[chunkhash:8].js',
  config.module.rules.push(
    {
      test: /\.styl/,
      use: ExtractPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
          'stylus-loader'
        ]
      })
    }
  ),
  config.plugins.push(
    new ExtractPlugin('styles.[contentHash:8].css'),
    // 注意vendor一定要放在runtime前面
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime'
    })
  )
}

module.exports = config
