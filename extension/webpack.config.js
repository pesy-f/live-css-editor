const webpack = require('webpack');
const RemoveSourceMapUrlWebpackPlugin = require('@rbarilani/remove-source-map-url-webpack-plugin');

const BABEL_OPTIONS = {
    // plugins: ['transform-es2015-modules-commonjs'],

    presets: [
        [
            "@babel/preset-env",
            {
                // Webpack understands the native import syntax, and uses it for tree shaking
                // https://babeljs.io/docs/en/babel-preset-env#modules
                // https://webhint.io/docs/user-guide/hints/hint-webpack-config/modules-false-babel/
                modules: false,

                // Currently, we wish to keep the transpilation to minimum, hence we are using this configuration for "browsers"
                // https://babeljs.io/docs/en/babel-preset-env#targets
                targets: {
                    // firefox: '68',
                    // chrome: '83'

                    browsers: [
                        "last 7 chrome versions",
                        "last 10 firefox versions",
                        "firefox esr"
                    ]
                    // "browsers": ["> 0.5%, last 2 versions, Firefox ESR, not dead"]
                    // Online REPL:
                    //     https://browserl.ist/
                }
            }
        ],
        '@babel/preset-react'
    ]
};

module.exports = {
    watch: true,
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'main.bundle.js',
        clean: true
    },

    // https://stackoverflow.com/questions/15097945/do-source-maps-work-for-chrome-extensions/23438324#23438324
    // https://bugs.chromium.org/p/chromium/issues/detail?id=212374
    devtool: false,                             // Recommended for production mode for a WebExtension
    // devtool: 'eval-cheap-module-source-map', // Recommended for development mode for a webpage/WebExtension
    // devtool: 'source-map',                   // Recommended for production mode for a webpage (this mode does not work well for a WebExtension)

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: BABEL_OPTIONS
                    }
                    // 'eslint-loader'
                ]
            }
        ]
    },

    plugins: [
        // https://stackoverflow.com/questions/42196819/disable-hide-download-the-react-devtools/48324794#48324794
        new webpack.DefinePlugin({
            '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'
        }),

        // This plugin is useful for removing (unwanted) sourcemap references. Which otherwise can lead to warnings in
        // console.
        // For example:
        //     When including some libraries, there might be references to "//# sourceMappingURL=..." which might not be
        //     possible to load / map-into-another-form for WebExtensions (Ref:
        //     https://bugs.chromium.org/p/chromium/issues/detail?id=212374)
        //
        //     Without this plugin, if you import 'react-command-palette' (Ref:
        //     https://www.unpkg.com/react-command-palette@0.16.2/dist/index.js) and the sourcemap reference from inside
        //     that library file (eg: "//# sourceMappingURL=index.js.map") is not transformed into another appropriate
        //     sourcemap (probably because sourcemaps are kept disabled when building for WebExtension), then it would
        //     attempt to load the sourcemap from an invalid path which would lead to a warning in console.
        new RemoveSourceMapUrlWebpackPlugin({
            test: /main\.bundle\.js$/
        })
    ]
};
