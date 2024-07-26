const DotenvWebpackPlugin = require('dotenv-webpack');
const { WebpackConfiguration } = require('webpack-dev-server');
const { resolve } = require('./utils/resolve');
const { generate } = require('./webpack.base');

// 此处的publicpath 与 .env对应的环境内 ROUTER_BASE 一致
const base = generate(false);
const basePlugins = base.plugins;

/**
 * @type {WebpackConfiguration}
 */
const config = {
    ...base,
    devServer: {
        static: {
            directory: resolve('dist'),
        },
        compress: true,
        open: true,
        hot: true,
        historyApiFallback: true,
        port: '3000',
        // host: 'local-ipv4', //关闭此选项，则是使用localhost
        // proxy: {
        //     '/api/question': {
        //         target: 'http://localhost:3000/api/question',
        //         pathRewrite: { '^/api/question': '' },
        //         changeOrigin: true,
        //     },
        // },
    },
    plugins: [...basePlugins, new DotenvWebpackPlugin({ path: resolve('.env') })],
};

module.exports = config;
