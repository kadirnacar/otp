const { merge } = require('webpack-merge');
const WebpackObfuscator = require('webpack-obfuscator');
const nodeExternals = require('webpack-node-externals');

module.exports = (config, context) => {
  return merge(
    config,
    config.mode == 'development'
      ? {
          externals: [nodeExternals()],
          module: {
            rules: [{ test: /\.svg$/, use: 'raw-loader' }],
          },
        }
      : {
          externals: [nodeExternals()],
          module: {
            rules: [
              {
                test: /\.ts$/,
                enforce: 'post',
                use: {
                  loader: WebpackObfuscator.loader,
                  options: {
                    rotateStringArray: true,
                  },
                },
              },
              {
                test: /\.tsx$/,
                enforce: 'post',
                use: {
                  loader: WebpackObfuscator.loader,
                  options: {
                    rotateStringArray: true,
                  },
                },
              },
              { test: /\.svg$/, use: 'raw-loader' },
            ],
          },
        }
  );
};
