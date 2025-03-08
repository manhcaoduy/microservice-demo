module.exports = function (options) {
  return {
    cache: false,
    target: 'node',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              module: {
                type: 'commonjs',
                strict: true,
                lazy: false,
                importInterop: 'swc',
              },
              isModule: true,
              jsc: {
                target: 'es2022',
                parser: {
                  syntax: 'typescript',
                  decorators: true,
                  dynamicImport: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true,
                  useDefineForClassFields: true,
                },
                keepClassNames: true,
              },
            },
          },
        },
      ],
    },
    output: {
      ...options.output,
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]',
    }
  };
};
;