const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getWebpackEntries } = require('./utils/getWebpackEntries');
const { resolve } = require('./utils/resolve');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const os = require('os');
const clientRoot = resolve('src');

/**
 * genrate webpack config
 * @param isOptimization {boolean}
 * @publicpath same with .env file of ROUTER_BASE
 * @returns {import("webpack-dev-server").WebpackConfiguration}
 */
const generate = (isOptimization = false, publicpath = '') => {
    console.log(`webpack build, isOptimization:${isOptimization}`);
    /**
     * @type {import("webpack").EntryObject}
     */
    const entries = {};
    /**
     * @type {HtmlWebpackPlugin[]}
     */
    const htmlPlugins = [];

    // vendor entry
    entries['vendor'] = ['react', 'react-dom'];

    // html entries
    const rawEntries = getWebpackEntries(clientRoot);
    // console.log('entry', rawEntries);
    rawEntries.forEach((entry) => {
        const entryName = entry.entryName;
        entries[entryName] = {
            import: [entry.entry],
            dependOn: 'vendor',
        };

        /**
         * @type {import('html-webpack-plugin'.Options)}
         */
        const htmlPluginOptions = {
            inject: true,
            filename: `${entry.entryName}.html`,
            template: entry.html,
            chunks: entryName ? ['vendor', entryName] : [],
            publicPath: publicpath,
            // favicon: resolve('src/favicon.ico'),
        };
        htmlPlugins.push(new HtmlWebpackPlugin(htmlPluginOptions));
    });

    // html plugins
    return {
        mode: isOptimization ? 'production' : 'development',
        devtool: isOptimization ? false : 'source-map',
        entry: entries,
        output: {
            path: resolve('dist'),
            filename: isOptimization ? '[name].[contenthash:8].js' : '[name].bundle.js',
            chunkFilename: isOptimization ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
            assetModuleFilename: '[name].[contenthash:8][ext][query]',
        },
        plugins: [
            ...htmlPlugins,
            new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash:8].css',
                chunkFilename: 'css/[id][name].[contenthash:8].chunk.css',
            }),
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                '@': clientRoot,
            },
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|mp3|webp)$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 1024, // 1kb
                        },
                    },
                },
                { test: /\.([cm]?ts|tsx)$/, loader: 'ts-loader' },
                {
                    test: /\.(js|jsx)$/,
                    loader: 'babel-loader',
                    resolve: {
                        fullySpecified: false,
                    },
                    options: {
                        cacheDirectory: true,
                    },
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
                    include: [resolve('src/assets/css/global.css'), resolve('node_modules')],
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 3,
                                modules: {
                                    localIdentName: '[name]_[local]-[hash:8]',
                                },
                            },
                        },
                        'less-loader',
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: false,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                modules: {
                                    localIdentName: '[name]_[local]-[hash:8]',
                                },
                            },
                        },
                        'postcss-loader',
                    ],
                    include: [clientRoot],
                    exclude: [resolve('src/assets/css/global.css')],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 3,
                                modules: {
                                    localIdentName: '[name]_[local]-[hash:8]',
                                },
                            },
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /\.svg$/i,
                    type: 'asset',
                    resourceQuery: /url/,
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    resourceQuery: { not: [/url/] },
                    use: ['@svgr/webpack'],
                },
            ],
        },
        optimization: {
            minimize: isOptimization,
            minimizer: isOptimization
                ? [
                      new TerserPlugin({
                          parallel: os.cpus().length,
                          extractComments: false,
                          terserOptions: {
                              output: {
                                  comments: false,
                              },
                              mangle: true,
                              compress: {
                                  drop_console: false,
                              },
                          },
                      }),
                  ]
                : undefined,
        },
    };
};

module.exports = { generate };
