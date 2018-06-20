// vue.config.js
module.exports = {
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
                .loader('vue-loader')
                .tap(options => {
                    return Object.assign({
                        'img': 'src',
                        'image': 'xlink:href',
                        'b-img': 'src',
                        'b-img-lazy': ['src', 'blank-src'],
                        'b-card': 'img-src',
                        'b-card-img': 'img-src',
                        'b-carousel-slide': 'img-src',
                        'b-embed': 'src'
                    }, options)
                })
    },
}