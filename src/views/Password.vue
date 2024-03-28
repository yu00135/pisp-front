<template>
  <div class="passwordContainer" style="display: flex;justify-content: center;align-items: center;height: 100vh">
    <el-card style="width: 30%" shadow="always">
      <span style="display: flex;justify-content: center;font-size: 30px">个人信息托管平台</span>
      <br>
      <br>
      <el-form :model="passwordForm" class="passwordForm" ref="passwordFormRef" :rules="passwordRules">
        <el-form-item prop="type">
          <el-select v-model="passwordForm.type" placeholder="请选择" style="width:90px">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <div v-if="passwordForm.type==='email'">
          <el-form-item prop="email">
            <el-input type="text" v-model="passwordForm.email" placeholder="请输入邮箱" prefix-icon="message"></el-input>
          </el-form-item>
        </div>
        <div v-if="passwordForm.type==='phone'">
          <el-form-item prop="phone">
            <el-input type="text" v-model="passwordForm.phone" placeholder="请输入手机号" prefix-icon="Iphone"></el-input>
          </el-form-item>
        </div>
        密码
        <el-form-item prop="password">
          <el-input type="password" v-model="passwordForm.password" placeholder="请输入新密码" prefix-icon="lock"
                    show-password></el-input>
        </el-form-item>
        确认密码
        <el-form-item prop="password1">
          <el-input type="password" v-model="passwordForm.password1" placeholder="请输入确认密码" prefix-icon="lock"
                    show-password></el-input>
        </el-form-item>
        <el-form-item prop="verify">
          <el-row>
            <el-col span="30">
              <el-input v-model="passwordForm.verify" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col span="20">
              <el-button type="primary" @click="getEmailCode" :loading="checkCodeBtn.loading"
                         :disabled="checkCodeBtn.disabled">{{ checkCodeBtn.text }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item class="passwordBtn">
          <el-button type="primary" @click="changePassword('passwordFormRef')">更改密码</el-button>
        </el-form-item>
      </el-form>
      <router-link to="/login">返回登录页面</router-link>
    </el-card>
  </div>
</template>

<script>
import {reactive, ref} from "vue";
import * as api from "@/api";
import {ElMessage} from "element-plus";
import {agent} from "@/utils/agent";
import {useRouter} from "vue-router";

export default {
  name: "Password",
  setup() {
    const router = useRouter()
    const options = [
      {
        value: 'email',
        label: '邮箱',
      },
      {
        value: 'phone',
        label: '手机号',
      }
    ]

    const passwordRules = {
      email: [
        {required: true, message: "请输入邮箱", trigger: "blur"},
        {
          validator: function (rule, value, callback) {
            let key = /^\w{1,64}@[a-z0-9]{1,256}(\.[a-z]{2,6}){1,2}$/i
            if (key.test(value) === false) {
              callback(new Error("邮箱格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur",
        }
      ],
      phone: [
        {required: true, message: "请输入手机号", trigger: "blur"},
        {
          validator: function (rule, value, callback) {
            let key = /^1[34578]\d{9}$/
            if (key.test(value) === false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
      password: [
        {required: true, message: '密码不能为空', trigger: 'blur'},
        {type: 'string', min: 6, max: 20, message: '密码应大于6位小于20位', trigger: 'blur'}
      ],
      password1: [
        {required: true, message: '确认密码不能为空', trigger: 'blur'},
        {type: 'string', min: 6, max: 20, message: '密码应大于6位小于20位', trigger: 'blur'},
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.password) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
    }

    let passwordForm = reactive({
      type: 'email',
      device: '',
      email: '',
      userName: '',
      phone: '',
      password: '',
      password1: '',
      verify: ''
    })
    const passwordFormRef = ref(null)


    let checkCodeBtn = reactive({
      text: '发送验证码',
      loading: false,
      disabled: false,
      duration: 30,
      timer: null
    })

    let getEmailCode = async () => {
      passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          // 清除掉定时器
          checkCodeBtn.timer && clearInterval(checkCodeBtn.timer)
          // 开启定时器
          checkCodeBtn.timer = setInterval(() => {
            const tmp = checkCodeBtn.duration--
            checkCodeBtn.text = `${tmp}秒`
            checkCodeBtn.disabled = true
            if (tmp <= 0) {
              // 清除掉定时器
              clearInterval(checkCodeBtn.timer)
              checkCodeBtn.duration = 30
              checkCodeBtn.text = '重新获取'
              // 设置按钮可以单击
              checkCodeBtn.disabled = false
            }
            console.info(checkCodeBtn.duration)
          }, 1000)
          let res = await api.getEmailCode(passwordForm);
          if (res.data.code === 200) {
            ElMessage({
              message: res.data.msg,
              type: "success",
              showClose: true,
            });
          } else {
            ElMessage({
              message: res.data.msg,
              type: "error",
              showClose: true,
            });
          }
        } else {
          return false
        }
      })
    }

    let changePassword = async () => {
      passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          passwordForm.device = agent()
          let res = await api.changePassword(passwordForm)
          if (res.data.code === 200) {
            ElMessage({
              message: res.data.msg,
              type: "success",
              showClose: true,
            });
            await router.push('/login')
          } else {
            ElMessage({
              message: res.data.msg,
              type: "error",
              showClose: true,
            });
          }
        } else {
          return false
        }
      })
    }

    return {
      options,
      passwordRules,
      passwordForm,
      passwordFormRef,
      checkCodeBtn,
      getEmailCode,
      changePassword,
    }
  }
}

</script>

<style scoped>

</style>
