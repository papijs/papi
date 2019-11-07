const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  target: 'node',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: ['babel-loader']
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, "src")
    },
    extensions: ['.ts', '.tsx', '.js']
  }
}
