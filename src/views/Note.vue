<template>
  <el-main>
    <div style="display: flex;">
      <el-input style="width:200px" type="text" placeholder="标题" v-model=searchForm.noteTitle clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="内容" v-model=searchForm.noteContent clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="标签" v-model=searchForm.noteTag clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>
    <br/>
    <el-space wrap>
        <div v-for="(tag,index) in tagList" :key=tag>
          <el-check-tag :checked="checked[index]" @change="selectTag(index)">{{tag}}</el-check-tag>
        </div>
    </el-space>
    <br/><br/>
    <el-space :spacer="spacer" wrap>
      <el-card v-for="note in notes" :key="note" class="box-card" style="display:flex;flex-direction: column;width: 20rem;height: 16rem" shadow="hover">
        <template #header>
          <div class="card-header" style="display:flex;justify-content: space-between">
            <el-link :href="'/note/info/'+note.noteId" :underline="false">{{note.noteTitle}}</el-link>
            <el-dropdown>
              <el-button type="text" icon="Operation"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="toNoteInfo(note.noteId)">修改</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(note.noteId)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-space wrap>
            <div v-if="note.noteTag!==''">
              <el-tag v-for="tag in note.noteTag.split(',')" :key=tag>
                <el-button type="text" @click="toTag(tag)">{{tag}}</el-button>
              </el-tag>
            </div>
          </el-space>
          <br/>
          {{note.noteDate}}
        </template>
         <div class="card-body">
           <p v-html="note.noteContent"></p>
         </div>
        <div>
        </div>
      </el-card>
    </el-space>
  </el-main>
</template>

<script>
import {h, ref, reactive, onMounted} from "vue";
import {ElDivider, ElMessage,ElMessageBox} from "element-plus";
import * as api from "@/api/note"
import {useRouter} from "vue-router";

export default {
  name: "Note",
  setup() {
    const router = useRouter()
    const spacer = h(ElDivider, {direction: 'vertical'})
    const notes = ref([])
    const tagList = ref([])
    const checked=ref([])
    const state = reactive({
      noteId: '',
      noteType: 'note',
      selectedTag: [],
    })
    const searchForm = reactive({
      noteTitle: '',
      noteContent: '',
      noteDate: '',
      noteTag: '',
    });
    const getTagList=async ()=>{
      const res= await api.getTagList(state);
      if(res.data.code===200){
        tagList.value=res.data.data

      }
    }
    onMounted(() => {
      getNoteList();
      getTagList();
    })
    const getNoteList = async () => {
      const res = await api.getNoteList();
      if (res.data.code === 200) {
        notes.value = res.data.data
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true
        })
      }
    }
    const toNoteInfo = (val) => {
      router.push("/note/info/"+val)
    }
    const handleDelete = (val) => {
      ElMessageBox.confirm(
          '该操作将删除笔记，是否继续？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      )
          .then(() => {
           deleteNote(val)
          })
          .catch(() => {
            ElMessage({
              type: 'info',
              message: '删除取消',
              showClose: true
            })
          })
    }
    const deleteNote = async (val) => {
      state.noteId=val
      const res=await api.deleteNote(state)
      if(res.data.code===200){
        ElMessage({
          type: 'success',
          message: res.data.msg,
          showClose: true
        })
      }else{
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
      await getNoteList();
    }
    const search = async () =>{
      const res=await api.searchNote(searchForm)
      if(res.data.code===200){
        notes.value=res.data.data
      }else{
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
    }
    const toTag= async (val) =>{
      searchForm.noteDate=''
      searchForm.noteContent=''
      searchForm.noteTitle=''
      searchForm.noteTag=val
      const res=await api.searchNote(searchForm)
      if(res.data.code===200){
        notes.value=res.data.data
      }else{
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
    }
    const selectTag=async (val) =>{
      state.selectedTag=[]
      checked.value[val] = checked.value[val] !== true;
      for(let i=0;i<tagList.value.length;i++){
        if(checked.value[i]===true){
          state.selectedTag.push(tagList.value[i])
        }
      }
      const res=await api.searchNoteByTag(state)
      if(res.data.code===200){
        notes.value=res.data.data
      }
    }
    return {
      state,
      notes,
      searchForm,
      spacer,
      tagList,
      checked,
      getNoteList,
      toNoteInfo,
      handleDelete,
      search,
      toTag,
      selectTag,
    }
  }
}

</script>

<style scoped>
</style>
