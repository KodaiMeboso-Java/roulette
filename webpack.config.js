const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { type } = require('node:os');

module.exports = {
    // ビルドの起点となるファイル
    entry: './src/index.js',
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    // ビルドしたファイルの出力設定
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    // モジュールに適用するルールを設定
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                    extensions: ['.js', '.jsx', '.json'],
                    // New resolve configuration
                    mainFields: ['main', 'module']
                },
                exclude: /node_modules/,
                type: 'javascript/auto',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: './index.html',
            favicon: './public/favicon.ico'
        })
    ],
    devServer: {
        hot: true,
        static: {
            directory: path.join(__dirname, 'dist'),
            publicPath: '/'
        }
    }
};
