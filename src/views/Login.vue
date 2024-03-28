<template>
  <div style="display: flex;justify-content: center;align-items: center;height: 100vh">
    <el-card style="width: 30%" shadow="always">
      <span style="display: flex;justify-content: center;align-items:center;font-size: 30px">个人信息托管平台</span>
      <br>
      <br>
      <el-tabs type="border-card" class="demo-tabs">
        <el-tab-pane>
          <template #label>
              <span>
                <el-icon><lock/></el-icon>密码登录
              </span>
          </template>
          <el-form :model="loginForm" class="loginForm" ref="loginFormRef" :rules="loginRules">
            <el-form-item prop="type">
              <el-select v-model="loginForm.type" placeholder="请选择" style="width:90px">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <div v-if="loginForm.type==='email'">
              <el-form-item prop="email">
                <el-input type="text" v-model="loginForm.email" placeholder="请输入邮箱" prefix-icon="message"></el-input>
              </el-form-item>
            </div>
            <div v-if="loginForm.type==='phone'">
              <el-form-item prop="phone">
                <el-input type="text" v-model="loginForm.phone" placeholder="请输入手机号" prefix-icon="Iphone"></el-input>
              </el-form-item>
            </div>
            <div v-if="loginForm.type==='userName'">
              <el-form-item prop="userName">
                <el-input type="text" v-model="loginForm.userName" placeholder="请输入用户名" prefix-icon="user"></el-input>
              </el-form-item>
            </div>
            <span>密码</span>
            <el-form-item prop="password">
              <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" prefix-icon="lock"
                        show-password></el-input>
            </el-form-item>
            <div class="loginBtn" style="display:flex;justify-content: center">
              <el-button size="large" type="primary" @click="passwordLogin('loginFormRef')">登录</el-button>
            </div>
          </el-form>

        </el-tab-pane>
        <el-tab-pane>
          <template #label>
              <span>
                <el-icon><message/></el-icon>验证码登录
              </span>
          </template>
          <el-form :model="loginForm1" class="loginForm" ref="loginFormRef1" :rules="loginRules1">
            <el-form-item prop="type">
              <el-select v-model="loginForm1.type" placeholder="请选择" style="width:90px">
                <el-option
                    v-for="item in options1"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <div v-if="loginForm1.type==='email'">
              <el-form-item prop="email">
                <el-input type="text" v-model="loginForm1.email" placeholder="请输入邮箱" prefix-icon="message"></el-input>
              </el-form-item>
            </div>
            <div v-if="loginForm1.type==='phone'">
              <el-form-item prop="phone">
                <el-input type="text" v-model="loginForm1.phone" placeholder="请输入手机号" prefix-icon="Iphone"></el-input>
              </el-form-item>
            </div>
            <span>验证码</span>
            <el-form-item prop="verify">
              <el-row>
                <el-col :span="18">
                  <el-input v-model="loginForm1.verify" placeholder="请输入验证码"></el-input>
                </el-col>
                <el-col :span="6">
                  <div v-if="loginForm1.type==='email'">
                    <el-button type="primary" @click="getEmailCode" :loading="checkCodeBtn.loading"
                               :disabled="checkCodeBtn.disabled">{{ checkCodeBtn.text }}
                    </el-button>
                  </div>
                  <div v-if="loginForm1.type==='phone'">
                    <el-button type="primary" @click="getPhoneCode" :loading="checkCodeBtn.loading"
                               :disabled="checkCodeBtn.disabled">{{ checkCodeBtn.text }}
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </el-form-item>
            <div class="loginBtn" style="display:flex;justify-content: center">
              <el-button size="large" type="primary" @click="verifyLogin('loginFormRef1')">登录</el-button>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div style="display:flex;justify-content: space-around">
        <router-link to="/password" target="_blank">忘记密码</router-link>
        <router-link to="/register">注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import {ref, reactive} from 'vue'
import * as api from "@/api"
import ElLoading, {ElMessage} from "element-plus"
import {useRouter} from 'vue-router'
import {agent} from "@/utils/agent"


export default {
  name: "Login",
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
      },
      {
        value: 'userName',
        label: '用户名',
      }
    ]
    const options1 = [
      {
        value: 'email',
        label: '邮箱',
      },
      {
        value: 'phone',
        label: '手机号',
      }
    ]

    const loginRules = {
      email: [
        {required: true, message: "请输入邮箱", trigger: "blur"},
        {
          validator: (rule, value, callback) => {
            const key = /^\w{1,64}@[a-z0-9]{1,256}(\.[a-z]{2,6}){1,2}$/i
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
          validator: (rule, value, callback) => {
            const key = /^1[34578]\d{9}$/
            if (key.test(value) === false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
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
        }
      ],
      password: [
        {required: true, message: '密码不能为空', trigger: 'blur'},
        {type: 'string', min: 6, max: 20, message: '密码应大于6位小于20位', trigger: 'blur'}
      ]
    }

    const loginRules1 = {
      email: [
        {required: true, message: "请输入邮箱", trigger: "blur"},
        {
          validator: (rule, value, callback) => {
            const key = /^\w{1,64}@[a-z0-9]{1,256}(\.[a-z]{2,6}){1,2}$/i
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
          validator: (rule, value, callback) => {
            const key = /^1[34578]\d{9}$/
            if (key.test(value) === false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
    }

    let loginForm = reactive({
      type: 'email',
      device: '',
      email: '',
      userName: '',
      phone: '',
      password: '',
      remember: false,
      verify: ''
    })

    let loginForm1 = reactive({
      type: 'email',
      device: '',
      email: '',
      phone: '',
      remember: false,
      verify: ''
    })

    const loginFormRef = ref(null)
    const loginFormRef1 = ref(null)

    let passwordLogin = async () => {
      loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loginForm.device = agent()
          let res = await api.passwordLogin(loginForm)
          if (res.data.code === 200) {
            ElMessage({
              message: res.data.msg,
              type: "success",
              showClose: true,
            });
            let data = JSON.stringify(res.data.data)
            sessionStorage.setItem("user", data)
            await router.push('/index')
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

    let verifyLogin = async () => {
      loginFormRef1.value.validate(async (valid) => {
        if (valid) {
          loginForm1.device = agent()
          let res = await api.verifyLogin(loginForm1)
          if (res.data.code === 200) {
            ElMessage({
              message: res.data.msg,
              type: "success",
              showClose: true,
            });
            let data = JSON.stringify(res.data.data)
            sessionStorage.setItem("user", data)
            await router.push('/index')
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


    let checkCodeBtn = reactive({
      text: '发送验证码',
      loading: false,
      disabled: false,
      duration: 30,
      timer: null
    })

    let getEmailCode = async () => {
      loginFormRef1.value.validate(async (valid) => {
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
          let res = await api.getEmailCode(loginForm1);
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

    let getPhoneCode = async () => {
      loginFormRef1.value.validate(async (valid) => {
        if (valid) {
          let res = await api.getPhoneCode(loginForm1);
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

    return {
      options,
      options1,
      loginRules,
      loginRules1,
      loginForm,
      loginForm1,
      loginFormRef,
      loginFormRef1,
      checkCodeBtn,
      passwordLogin,
      verifyLogin,
      getEmailCode,
      getPhoneCode,
    }
  }


}
</script>

<style scoped>

</style>
