const DotenvWebpackPlugin = require('dotenv-webpack');
const { WebpackConfiguration } = require('webpack-dev-server');
const { resolve } = require('./utils/resolve');
const { generate } = require('./webpack.base');

// 此处的publicpath 与 .env对应的环境内 ROUTER_BASE 一致
const base = generate(true, '');
const basePlugins = base.plugins;

/**
 *
 * @type {WebpackConfiguration}
 */
const config = {
    ...base,
    plugins: [...basePlugins, new DotenvWebpackPlugin({ path: resolve('.env.prod') })],
};

module.exports = config;
