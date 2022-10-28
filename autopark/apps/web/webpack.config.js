const { merge } = require('webpack-merge');
var WebpackObfuscator = require('webpack-obfuscator');

module.exports = (config, context) => {
  return merge(
    config,
    config.mode == 'development'
      ? {
          module: {
            rules: [
              { test: /\.svg$/, use: 'raw-loader' },
            ],
          },
        }
      : {
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
