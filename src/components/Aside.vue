<template>
  <el-aside class="aside" :width="isCollapse">
    <el-menu style="min-height: 100vh;"
             :default-openeds="['1']"
             :collapse="isCollapse"
    >
      <div style="display:flex;justify-content:center;">
        <el-button v-if="isCollapse" icon="Expand" style="width:100vh;border: none;"
                   @click="handleCollapse"></el-button>
        <el-button v-else icon="Fold" style="width:100vh;border: none;" @click="handleCollapse"></el-button>
      </div>
      <el-menu-item index="0" @click="toSite">
        <el-icon>
          <Link/>
        </el-icon>
        <span>网站</span>
      </el-menu-item>
      <el-menu-item index="1" @click="toContact">
        <el-icon>
          <phone/>
        </el-icon>
        <span>通讯录</span>
      </el-menu-item>
      <el-menu-item index="2" @click="toCard">
        <el-icon>
          <credit-card/>
        </el-icon>
        <span>卡包</span>
      </el-menu-item>
      <el-menu-item index="3" @click="toFile">
        <el-icon>
          <cloudy/>
        </el-icon>
        <span>文件</span>
      </el-menu-item>
      <el-sub-menu index="4">
        <template #title>
          <el-icon>
            <Notebook/>
          </el-icon>
          <span>笔记</span>
        </template>
        <el-menu-item index="4-1" @click="toWrite">写笔记</el-menu-item>
        <el-menu-item index="4-2" @click="toNote">笔记</el-menu-item>
        <el-menu-item index="4-3" @click="toDiary">日记</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>

</template>

<script>
import {useRouter} from "vue-router"
import {ref} from "vue"

export default {
  name: "Aside",
  setup() {
    const router = useRouter()
    const isCollapse = ref(false)
    const handleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }
    const toSite = () => {
      router.push('/site')
    }
    const toAccount = () => {
      router.push('/account')
    }
    const toContact = () => {
      router.push('/contact')
    }
    const toCard = () => {
      router.push('/card')
    }
    const toWrite = () => {
      router.push('/write')
    }
    const toNote = () => {
      router.push('/note')
    }
    const toDiary = () => {
      router.push('/diary')
    }
    const toFile = () => {
      router.push('/file/0')
    }
    return {
      isCollapse,
      handleCollapse,
      toSite,
      toAccount,
      toContact,
      toCard,
      toWrite,
      toNote,
      toDiary,
      toFile,
    }

  }
}
</script>

<style scoped>
aside {
  height: 100%;
}
</style>
