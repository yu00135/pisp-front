import http from "@/utils/http";

export const getCardList = () => {
    return http
        .post("/card/getList")
}
export const getCardPage = (params) => {
    return http
        .post("/card/getPage", params)
}
export const addCard = (params) => {
    return http
        .post("/card/add", params)
}
export const editCard = (params) => {
    return http
        .post("/card/edit", params)
}
export const deleteCard = (params) => {
    return http
        .post("/card/delete", params)
}
export const deleteSelectedCard = (params) => {
    return http
        .post("/card/deleteSelected", params)
}
export const search = (params) => {
    return http
        .post("/card/search", params)
}
