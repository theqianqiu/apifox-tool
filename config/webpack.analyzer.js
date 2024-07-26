const DotenvWebpackPlugin = require('dotenv-webpack');
const { WebpackConfiguration } = require('webpack-dev-server');
const { resolve } = require('./utils/resolve');
const { generate } = require('./webpack.base');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const base = generate(false);
const basePlugins = base.plugins;

/**
 *
 * @type {WebpackConfiguration}
 */
const config = {
    ...base,
    devServer: {
        static: {
            directory: resolve('dist'),
        },
        compress: true,
        host: 'local-ipv4',
        port: 8080,
        open: true,
        hot: true,
        historyApiFallback: true,
    },
    plugins: [...basePlugins, new DotenvWebpackPlugin({ path: resolve('.env') }), new BundleAnalyzerPlugin()],
};

module.exports = config;
