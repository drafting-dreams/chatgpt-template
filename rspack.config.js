const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CssExtractRspackPlugin } = require('@rspack/core')

module.exports = {
  entry: {
    chatgpt_content: path.resolve(__dirname, 'src/chatgpt_content/index.tsx'),
    deep_seek_content: path.resolve(__dirname, 'src/deep_seek/index.tsx'),
    claude_content: path.resolve(__dirname, 'src/claude/index.tsx'),
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
    new CssExtractRspackPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
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
              tsx: true,
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        use: [CssExtractRspackPlugin.loader, 'css-loader', 'postcss-loader'],
        type: 'javascript/auto',
      },
    ],
  },
}
