import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/icons/iconfont/iconfont.css'
import './assets/icons/iconfont/iconfont.js'
import cookie from 'vue-cookie'
import 'default-passive-events'

const app = createApp(App)

app.config.globalProperties.$cookie = cookie

import axios from './utils/http'
import * as ElIconModules from "@element-plus/icons";
app.config.globalProperties.$axios = axios

for(let iconName in ElIconModules){
    app.component(iconName,ElIconModules[iconName])
}

app.use(router).use(store).use(ElementPlus,{ locale })
app.mount('#app')


// eslint-disable-next-line no-unused-vars
app.config.errorHandler = (err, vm, info) => {
    // 处理错误
    // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
}
