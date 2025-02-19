const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  module: {
    rules: [
      // Transpile all JS/TS files with Babel or ts-loader for compatibility
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Transpile modern JS to ES5
              '@babel/preset-react', // Support JSX
              '@babel/preset-typescript', // Support TypeScript
            ],
          },
        },
      },
      // Resolve fully-specified ES modules
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false, // Prevent node-only modules like `fs` from breaking the build
      path: false,
    },
  },
};
