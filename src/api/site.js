import http from "@/utils/http";

export const getSiteList = () => {
    return http
        .post("/site/getList")
}
export const getSitePage = (params) => {
    return http
        .post("/site/getPage", params)
}
export const addSite = (params) => {
    return http
        .post("/site/add", params)
}
export const editSite = (params) => {
    return http
        .post("/site/edit", params)
}
export const deleteSite = (params) => {
    return http
        .post("/site/delete", params)
}
export const deleteSelectedSite = (params) => {
    return http
        .post("/site/deleteSelected", params)
}
export const search = (params) => {
    return http
        .post("/site/search", params)
}
