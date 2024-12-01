const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
    options: path.resolve(__dirname, 'src/options/index.tsx'),
    side_panel: path.resolve(__dirname, 'src/side_panel/index.tsx'),
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
      chunks: ['side_panel'],
      filename: 'side_panel.html',
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
