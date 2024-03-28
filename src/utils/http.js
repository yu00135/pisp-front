import axios from 'axios';
import qs from 'qs'
import { ElMessage, ElLoading } from "element-plus";
import router from '@/router'
let loading = null

const service = axios.create({
    timeout: 5 * 1000,                                   //超时时间
    baseURL: "api",
    headers:{
        "Content-Type":"application/json;charset=UTF-8",
    }
})
// http request 拦截器
service.interceptors.request.use(req => {
    /*loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    })*/

    //const token = store.state.token;
    //token && (req.headers.Authorization = token);
    return req

}, err => {
    return Promise.reject(err)
})
// http response 拦截器
service.interceptors.response.use(response => {
    //loading.close()
    console.log("response ->" + response)
    let res = response.data
    if (res.code === 200) {
        return response
    } else {
        ElMessage.error(!res.msg ? '系统异常' : res.msg)
        // 拒绝流程继续往下走
        return Promise.reject(response.data.msg)
    }
}, error => {
    // 401没权限
    if (error.response.data.code === 401) {
        ElMessage({
            type:"error",
            message:error.response.data.msg,
            showClose:true,
            duration:5*1000
        })
        return router.replace("/login")
    }
    else if (error.response.status === 500) {
        ElMessage({
            type:"error",
            message:"服务器开小差了，请稍后再来",
            showClose:true,
            duration:5*1000
        })
    }
    else{
        ElMessage({
            type:"error",
            message:error.message,
            showClose:true,
            duration:5*1000
        })
    }
    return Promise.reject(error)
    //loading.close()
})

export function get(url, params){
    return new Promise((resolve, reject) =>{
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data);
        }).catch(err =>{
            reject(err.data)
        })
    });}
export function post(url, params) {
    return new Promise((resolve, reject) => {
        axios.post(url, qs.stringify(params))
            .then(res => {
                resolve(res.data);
            })
            .catch(err =>{
                reject(err.data)
            })
    });
}
export default service;
