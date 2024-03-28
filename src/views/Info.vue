<template>
  <el-main>
    <el-descriptions
        title="账号信息"
        :column="1"
        border
        direction="vertical"
    >
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <user/>
            </el-icon>
            头像
            <el-button @click="handleUpload">上传</el-button>
          </div>
        </template>
        <el-image :src="imageUrl?imageUrl+'?t='+(new Date().getTime()):''" style="width: 100px;height: 100px"></el-image>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <user/>
            </el-icon>
            用户名
            <el-button @click="editUserName">修改</el-button>
          </div>
        </template>
        <span v-if="userName">{{ user.userName }}</span>
       <el-input v-else v-model="user.userName"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <iphone/>
            </el-icon>
            手机号
            <el-button @click="handleEditPhone">修改</el-button>
          </div>
        </template>
        {{ user.userPhone }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <message/>
            </el-icon>
            邮箱
            <el-button @click="handleEditEmail">修改</el-button>
          </div>
        </template>
        {{user.userEmail}}
      </el-descriptions-item>
    </el-descriptions>

    <el-dialog v-model="dialogFormVisible" :title="dialogTitle()">
      <div v-if="dialogType==='avatar'">
        头像
        <el-upload
            class="avatar-uploader"
            action="api/user/upload"
            :show-file-list="false"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            accept=".jpg,.jpeg,.png,.bmp,.webp,.JPG,.JPEG,.PNG,.BMP"
        >
          <el-icon  class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </div>
      <div v-else-if="dialogType==='phone'">
        <div v-if="active===0">
          <el-input v-model="user.userPhone" disabled></el-input>
          <el-input placeholder="验证码"></el-input>
          <el-button>发送验证码</el-button>
        </div>
        <div v-if="active===1">
          <el-input v-model="editForm.userPhone"></el-input>
          <el-input placeholder="验证码"></el-input>
          <el-button>发送验证码</el-button>
        </div>
        <div v-if="active===2">
          <span>恭喜您,已完成新手机号的绑定,请点击下方按钮重新登录</span>
        </div>
        <el-steps :active="active" finish-status="success">
          <el-step title="Step 1" description="验证当前手机" />
          <el-step title="Step 2" description="验证新手机" />
          <el-step title="Step 3" description="完成" />
        </el-steps>
        <el-button @click="next">Next step</el-button>
      </div>
      <div v-else-if="dialogType==='email'">
        <div v-if="active===0">
          <el-input v-model="user.userEmail" disabled></el-input>
          <el-input placeholder="验证码"></el-input>
          <el-button>发送验证码</el-button>
        </div>
        <div v-if="active===1">
          <el-input v-model="editForm.userEmail"></el-input>
          <el-input placeholder="验证码"></el-input>
          <el-button>发送验证码</el-button>
        </div>
        <div v-if="active===2">
          <span>恭喜您,已完成新邮箱的绑定,请点击下方按钮重新登录</span>
        </div>
        <el-steps :active="active" finish-status="success">
          <el-step title="Step 1" description="验证当前邮箱" />
          <el-step title="Step 2" description="验证新邮箱" />
          <el-step title="Step 3" description="完成" />
        </el-steps>
        <el-button @click="next">Next step</el-button>
      </div>
    </el-dialog>
  </el-main>
</template>

<script>
import {defineComponent, onMounted, reactive, ref} from "vue"
import {ElMessage} from "element-plus"
import * as api from '@/api/index'
import {agent} from "@/utils/agent";
import {useRouter} from "vue-router";

export default defineComponent({
  name: "Info",
  setup() {
    const router=useRouter()
    const loginUser = JSON.parse(sessionStorage.getItem('user'))
    const active = ref(0)
    const dialogFormVisible=ref(false)
    const dialogType=ref()
    const imageUrl = ref('')
    const userName = ref(true)
    const user=reactive({
      userName:'',
      userPhone:'',
      userEmail:'',
    })
    const editForm=reactive({
      userPhone:'',
      userEmail:'',
    })

    onMounted(()=>{
      user.userName=loginUser.userName
      user.userPhone=loginUser.userPhone
      user.userEmail=loginUser.userEmail
      imageUrl.value='http://127.0.0.1/avater/'+loginUser.userId+'.jpg'
    })

    const next = () => {
      if (active.value++ > 2) active.value = 0
    }
    const dialogTitle= ()=>{
      if(dialogType.value==='avatar'){
        return '上传头像'
      }else if(dialogType.value==='phone'){
        return '修改手机号'
      }else if(dialogType.value==='email'){
        return '修改邮箱'
      }
    }
    const handleUpload= ()=>{
      dialogFormVisible.value=true
      dialogType.value='avatar'
    }
    const handleEditPhone=()=>{
      dialogFormVisible.value=true
      dialogType.value='phone'
    }
    const handleEditEmail=()=>{
      dialogFormVisible.value=true
      dialogType.value='email'
    }
    const editUserName=async ()=>{
      if(userName.value===true){
        userName.value=false
      }else{
        const res=await api.edit(user)
        if(res.data.code===200){
          sessionStorage.setItem("user",JSON.stringify(res.data.data));
          userName.value=true
        }else{
          ElMessage({
            message:res.data.msg,
            type:"error",
            showClose:true
          })
        }
      }
    }
    const handleSuccess=()=>{
      ElMessage({
        message:"头像上传成功",
        type:"success",
        showClose:true
      })
      imageUrl.value='http://127.0.0.1/avater/'+user.userId+'.jpg'+'?t='+new Date().getTime()
    }
    const beforeUpload=(file)=>{
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const list = ["jpg", "jpeg", "png", "bmp", "webp", "JPG","JPEG","PNG","BMP",];
      if (list.indexOf(fileSuffix) === -1) {
        ElMessage.error('图片格式有误!')
        return false
      } else if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过2MB!')
        return false
      }
      return true
    }
    const logoutForm={
      userId: loginUser.userId,
      device: agent()
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
      editForm,
      loginUser,
      active,
      dialogType,
      dialogFormVisible,
      userName,
      imageUrl,
      next,
      dialogTitle,
      handleUpload,
      handleEditPhone,
      handleEditEmail,
      editUserName,
      beforeUpload,
      handleSuccess,
      logout
    }
  }
})
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
