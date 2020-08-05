const path = require("path")
// const webpack = require("webpack")
const CompressionWebpackPlugin = require("compression-webpack-plugin")
const isProduction = process.env.NODE_ENV === "production"

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: !isProduction,
  productionSourceMap: false,
  devServer: {
    open: false, // 是否自动打开浏览器页面
    host: "0.0.0.0", // 指定使用一个 host。默认是 localhost, 0.0.0.0可以被其他电脑访问，以ip形式出现
    hot: true, // 热更新
    port: 9999, // 端口地址
    https: false, // 使用https提供服务
    proxy: {
      "/api": {
        target: "",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    },
    watchOptions: {
      // 不监听的文件或文件夹，支持正则匹配
      ignored: /node_modules/,
      // 监听到变化后等300ms再去执行动作
      aggregateTimeout: 300,
      // 默认每秒询问1000次
      poll: 1000
    }
  },
  configureWebpack: config => {
    if (isProduction) {
      // 开启gzip压缩
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: /\.js$|\.html$|\.json$|\.css/,
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }
  },
  chainWebpack(config) {
    config.plugins.delete("preload") // TODO: need test
    config.plugins.delete("prefetch") // TODO: need test

    // set svg-sprite-loader
    config.module
      .rule("svg")
      .exclude.add(resolve("src/icons"))
      .end()
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === "development", config =>
        config.devtool("cheap-source-map")
      )

    config.when(process.env.NODE_ENV !== "development", config => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end()
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial" // only package third parties that are initially dependent
          },
          elementUI: {
            name: "chunk-elementUI", // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"), // can customize your rules
            minChunks: 2, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      config.optimization.runtimeChunk("single")
    })
  }
}
