const path = require('path')

module.exports = {
  entry: {
    content: path.resolve(__dirname, 'src/content/index.tsx'),
    options: path.resolve(__dirname, 'src/options/index.tsx'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  builtins: {
    html: [
      {
        chunks: ['content'],
        filename: 'content.html',
        minify: true,
        template: './src/index.html',
      },
      {
        chunks: ['options'],
        filename: 'options.html',
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
