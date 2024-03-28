import http from "@/utils/http";

export const getContactList = () => {
    return http
        .post("/contact/getList")
}
export const getContactPage = (params) => {
    return http
        .post("/contact/getPage", params)
}
export const addContact = (params) => {
    return http
        .post("/contact/add", params)
}
export const editContact = (params) => {
    return http
        .post("/contact/edit", params)
}
export const deleteContact = (params) => {
    return http
        .post("/contact/delete", params)
}
export const deleteSelectedContact = (params) => {
    return http
        .post("/contact/deleteSelected", params)
}
export const search = (params) => {
    return http
        .post("/contact/search", params)
}
