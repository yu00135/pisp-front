<template>
  <div class="registerContainer" style="display: flex;justify-content: center;align-items:center;height: 100vh">
    <el-card style="width: 30%;" shadow="always">
      <span style="display: flex;justify-content: center;font-size: 30px">欢迎来到个人信息托管平台</span>
      <el-form :model="registerForm" class="registerForm" ref="registerFormRef" :rules="registerRules">
        邮箱
        <el-form-item prop="email">
          <el-input type="text" v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="message"></el-input>
        </el-form-item>
        用户名
        <el-form-item prop="userName">
          <el-input type="text" v-model="registerForm.userName" placeholder="请输入用户名" prefix-icon="user"></el-input>
        </el-form-item>
        密码
        <el-form-item prop="password">
          <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" prefix-icon="lock"
                    show-password></el-input>
        </el-form-item>
        确认密码
        <el-form-item prop="password1">
          <el-input type="password" v-model="registerForm.password1" placeholder="请再次输入密码" prefix-icon="lock"
                    show-password></el-input>
        </el-form-item>
        <el-form-item prop="verify">
          <el-row>
            <el-col :span="16">
              <el-input type="text" v-model="registerForm.verify" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="4"/>
            <el-col :span="4">
              <el-button type="primary" @click="getEmailCode" :loading="checkCodeBtn.loading"
                         :disabled="checkCodeBtn.disabled">{{ checkCodeBtn.text }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item class="registerBtn">
          <el-button type="primary" @click="register('registerFormRef')">注册</el-button>
        </el-form-item>
      </el-form>
      <router-link to="/login">返回登录页面</router-link>
    </el-card>
  </div>
</template>

<script>
import {ref, reactive} from "vue"
import * as api from "@/api"
import {ElMessage} from "element-plus"
import {useRouter} from "vue-router";

export default {
  name: "register",
  setup() {
    const router = useRouter()
    let registerForm = reactive({
      type: '',
      email: '',
      phone: '',
      userName: '',
      password: '',
      password1: '',
      verify: ''
    })
    let checkUnique = reactive({
      type: '',
      content: '',
    })
    let checkCodeBtn = reactive({
      text: '发送验证码',
      loading: false,
      disabled: false,
      duration: 30,
      timer: null
    })

    const validateEmail = (rule, value, callback) => {
      checkUnique.type = "email"
      checkUnique.content = value
      api.check(checkUnique).then(res => {
        if (res.data.data != null)
          callback("该邮箱已被注册")
        else
          callback()
      })
    }
    const validatePhone = (rule, value, callback) => {
      checkUnique.type = "phone"
      checkUnique.content = value
      api.check(checkUnique).then(res => {
        if (res.data.data != null)
          callback("该手机号已被注册")
        else
          callback()
      })
    }
    const validateName = (rule, value, callback) => {
      checkUnique.type = "userName"
      checkUnique.content = value
      api.check(checkUnique).then(res => {
        if (res.data.data != null)
          callback("该用户名已被注册")
        else
          callback()
      })
    }
    const registerRules = {
      email: [
        {required: true, message: "请输入邮箱", trigger: "blur"},
        {
          validator: function (rule, value, callback) {
            if (/^\w{1,64}@[a-z0-9]{1,256}(\.[a-z]{2,6}){1,2}$/i.test(value) === false) {
              callback(new Error("邮箱格式错误"));
            } else {
              callback()
            }
          },
          trigger: "blur"
        },
        {required: true, trigger: 'blur', validator: validateEmail}
      ],
      mobile: [
        {required: true, message: "请输入手机号码", trigger: "blur"},
        {
          validator: function (rule, value, callback) {
            if (/^1[34578]\d{9}$/.test(value) === false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback()
            }
          },
          trigger: "blur"
        },
        {required: true, trigger: 'blur', validator: validatePhone}
      ],
      userName: [
        {required: true, message: '用户名不能为空', trigger: 'blur'},
        {type: 'string', min: 4, max: 15, message: '用户名应为4-15位字符', trigger: 'blur'},
        {
          validator: (rule, value, callback) => {
            const key = /[^\u4e00-\u9fa5a-zA-Z0-9\w]/g //非法字符
            if (!key.test(value) === false) {
              callback(new Error("用户名应为字母,数字,下划线,禁止输入非法字符"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        },
        {required: true, trigger: 'blur', validator: validateName}
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
            if (value !== registerForm.password) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
    }

    const registerFormRef = ref(null)

    const getEmailCode = async () => {
      registerFormRef.value.validate(async (valid) => {
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
          let res = await api.getEmailCode(registerForm);
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

    const register = async () => {
      let res = await api.register(registerForm);
      if (res.data.code === 200) {
        ElMessage({
          message: "注册成功",
          type: "success",
          showClose: true,
        });
        await router.push('/login')
      } else {
        console.log();
      }
    }

    let toLogin = () => {

    }


    return {
      registerForm,
      registerFormRef,
      registerRules,
      checkCodeBtn,
      getEmailCode,
      register,
      toLogin,
    }
  }
}
</script>

<style scoped>

</style>
