<template>
<div id="app">
  <el-container v-if="state.showMenu" class="container">
    <Aside></Aside>
    <el-container direction="vertical" class="content">
      <Header></Header>
      <router-view />
      <Footer></Footer>
    </el-container>
  </el-container>
  <div v-else>
    <router-view />
  </div>
</div>

</template>

<script>
import Aside from '@/components/Aside'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {defineComponent,ref,reactive, onUnmounted} from "vue"
import {useRouter} from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Aside,
    Header,
    Footer,
  },
  setup() {
    const pathMap = {
      index: '首页',
      login: '登录',
      register: '注册',
      password: '更改密码',
      contact: '通讯录',
      site: '网站',
      card: '卡包',
      info: '个人信息',
      file: '文件',
      note: '笔记列表',
      diary: '日记列表',
      write: '写笔记',
      noteInfo: '笔记详情'
    }
    let loading=ref()
    const user=sessionStorage.getItem("user")
    const router=useRouter()
    const noMenu = ['/login','/register','/password','/404','/Login','/Register']
    const state = reactive({
      showMenu: false,
    })
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', () => {
        if (!user) {
          state.showMenu = false
        }
      }, false);
    }

    const unwatch = router.beforeEach((to, from, next) => {
      next()
      state.showMenu = !noMenu.includes(to.path)
      state.currentPath = to.path
      document.title = pathMap[to.name]
      if(document.title==="undefined"){
        document.title="404"
      }
    })

    onUnmounted(() => {
      unwatch()
    })

    return {
      state,
      loading,
    }
  }
})
</script>

<style>
body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.container {
  height: 100vh;
}
.content {
  display: flex;
  min-height: 100vh;
}
</style>
