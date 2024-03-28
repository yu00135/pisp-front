const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: false,// 是否为生产环境构建生成sourceMap?
  lintOnSave: false,
  devServer: {
    port: 8081, //本机端口号
    host: "localhost", //本机主机名
    https: false, //协议
    open: true, //启动服务器时自动打开浏览器访问
    proxy: {
      '/api': {
        // 目标服务器地址，代理访问：
        target: "http://localhost:8080",
        changOrigin: true, //开启代理
        ws: true,
        pathRewrite: {
          '^/api': '',
          'file/api': '',
          'note/info/api/': ''
        }
      }
    }
  },
})
