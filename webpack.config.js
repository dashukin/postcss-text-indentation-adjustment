var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: {
		'index': './src/index'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs2',
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: ['babel-loader']
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.optimize.UglifyJsPlugin()
	]
};