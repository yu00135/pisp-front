import http from "@/utils/http";

export const getFileList = (params) => {
    return http
        .post("/file/getList",params)
}
export const getFolderList = (params) => {
    return http
        .post("/file/getFolderList",params)
}
export const getParentId = (params) => {
    return http
        .post("/file/getParentId",params)
}
export const getPath = (params) => {
    return http
        .post("/file/getPath",params)
}
export const addFile = (params) => {
    return http
        .post("/file/add", params)
}
export const rename = (params) => {
    return http
        .post("/file/rename", params)
}
export const deleteFile = (params) => {
    return http
        .post("/file/delete", params)
}
export const deleteSelectedFile = (params) => {
    return http
        .post("/file/deleteSelected", params)
}
export const createFolder = (params) => {
    return http
        .post("/file/createFolder", params)
}
export const search = (params) => {
    return http
        .post("/file/search", params)
}
export const move = (params) => {
    return http
        .post("/file/move", params)
}
export const copy = (params) => {
    return http
        .post("/file/copy", params)
}
export const getSpace= (params) => {
    return http
        .post("/file/space",params)
}
