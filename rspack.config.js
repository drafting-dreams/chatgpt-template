const path = require('path')

module.exports = {
  entry: {
    chatgpt_content: path.resolve(__dirname, 'src/chatgpt_content/index.tsx'),
    options: path.resolve(__dirname, 'src/options/index.tsx'),
    popup: path.resolve(__dirname, 'src/popup/index.tsx'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  builtins: {
    html: [
      {
        chunks: ['chatgpt_content'],
        filename: 'chatgpt_content.html',
        minify: true,
        template: './src/index.html',
      },
      {
        chunks: ['options'],
        filename: 'options.html',
        minify: true,
        template: './src/index.html',
      },
      {
        chunks: ['popup'],
        filename: 'popup.html',
        minify: true,
        template: './src/index.html',
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'sass-loader',
          },
        ],
        type: 'css/module',
      },
    ],
  },
}
