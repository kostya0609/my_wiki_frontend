module.exports = {
    devServer: {
        https: true,
        host : 'localhost',
        port : 8081
    },
    publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
}