<template>
  <el-header class="header">
      <div style="justify-content: flex-start;display: flex;align-items: center;">
        <el-link href="/index" :underline="false" style="font-size: large">个人信息托管平台</el-link>
      </div>

      <div style="flex:1;justify-content: flex-end;display: flex;align-items: center;">
        <el-avatar icon="user" :src="imageUrl?imageUrl+'?t='+(new Date().getTime()):''" fit="fill"></el-avatar>
        <el-dropdown>
          <span style="cursor: pointer;">{{ user.userName }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="accountInfo">个人信息</el-dropdown-item>
              <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
  </el-header>
</template>

<script>
import {useRouter} from 'vue-router'
import * as api from "@/api/index"
import {ElMessage} from "element-plus";
import {agent} from "@/utils/agent";
import {ref} from "vue";

export default {
  name: "Header",
  setup() {
    const router = useRouter()
    const user = JSON.parse(sessionStorage.getItem('user'))
    const accountInfo = () => {
      router.push('/info')
    }

    const imageUrl = ref('http://127.0.0.1/avater/'+user.userId+'.jpg'+'?t='+new Date().getTime())


    const logoutForm={
      userId: user.userId,
      device: agent()
    }

    const href = router.resolve({
      name:'password',
      path: '/password',
    })
    const changePassword= () =>{
      window.open(href.href,'_blank')
    }

    const logout = async () => {
      sessionStorage.setItem('user', null)
      let res = await api.logout(logoutForm)
      if (res.data.code === 200)
        ElMessage({
          message: res.data.msg,
          type: "success",
          showClose:true,
        });
      await router.push('/login')
    }
    return {
      user,
      imageUrl,
      accountInfo,
      changePassword,
      logout,
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  position: relative;
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
}
</style>
