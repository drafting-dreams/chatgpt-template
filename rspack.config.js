const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    bard_content: path.resolve(__dirname, 'src/bard_content/index.tsx'),
    bard_helper: path.resolve(__dirname, 'src/bard_content/helper.ts'),
    chatgpt_content: path.resolve(__dirname, 'src/chatgpt_content/index.tsx'),
    deep_seek_content: path.resolve(__dirname, 'src/deep_seek/index.tsx'),
    options: path.resolve(__dirname, 'src/options/index.tsx'),
    popup: path.resolve(__dirname, 'src/popup/index.tsx'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['options'],
      filename: 'options.html',
      minify: true,
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      filename: 'popup.html',
      minify: true,
      template: './src/index.html',
    }),
  ],
  experiments: {
    css: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
}
