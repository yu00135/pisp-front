import http from "@/utils/http";

export const write = (params) => {
    return http
        .post("/note/write",params)
}
export const edit = (params) => {
    return http
        .post("/note/edit",params)
}
export const getNoteList = (params) => {
    return http
        .post("/note/getNoteList",params)
}
export const getDiaryList = (params) => {
    return http
        .post("/note/getDiaryList",params)
}
export const getNoteByNoteId = (params) => {
    return http
        .post("/note/getNoteByNoteId",params)
}
export const deleteNote = (params) =>{
    return http
        .post("/note/delete",params)
}
export const deleteSelected = (params) =>{
    return http
        .post("/note/deleteSelected",params)
}
export const searchNote = (params) =>{
    return http
        .post("/note/searchNote",params)
}
export const searchDiary = (params) =>{
    return http
        .post("/note/searchDiary",params)
}
export const clean = (params) =>{
    return http
        .post("/note/clean",params)
}
export const getTagList=(params)=>{
    return http
        .post("/note/getTagList",params)
}
export const searchNoteByTag=(params)=>{
    return http
        .post("/note/searchNoteByTag",params)
}
export const searchDiaryByTag=(params)=>{
    return http
        .post("/note/searchDiaryByTag",params)
}
