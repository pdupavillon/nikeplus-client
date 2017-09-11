process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
var path = require('path')
var webpack = require('webpack')
var dist = path.resolve(__dirname, './dist')
var nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',
  output: {
    path: dist,
    filename: 'nike.js'
  },
  target: 'node',
  node:{
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc:false,
          presets:['es2015', 'stage-2']
        }

      }
    ]
  },
  plugins:[]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
