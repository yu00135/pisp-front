import http from '@/utils/http'

export const passwordLogin = (params) => {
    return http
        .post("/user/passwordLogin", params)
}
export const verifyLogin = (params) => {
    return http
        .post("/user/verifyLogin", params)
}
export const changePassword = (params) => {
    return http
        .post("/user/changePassword", params)
}
export const logout = (params) => {
    return http
        .post("/user/logout", params)
}
export const check = (params) => {
    return http
        .post("/user/check", params)
}
export const getEmailCode = (params) => {
    return http
        .post("/verify/emailCode",params)
}
export const getPhoneCode = (params) => {
    return http
        .post("/verify/phoneCode",params)
}
export const register = (params) => {
    return http
        .post("/user/emailRegister", params)
}
export const edit = (params) => {
    return http
        .post("/user/edit", params)
}




