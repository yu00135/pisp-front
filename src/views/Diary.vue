<template>
  <el-menu id="rightMenu" class="rightMenu" v-show="menuVisible" @mouseleave="closeMenu">
    <el-menu-item @click="toNoteInfo(currentRow.noteId)">打开</el-menu-item>
    <el-menu-item @click="handleDelete(currentRow.noteId)">删除</el-menu-item>
  </el-menu>
  <el-main>
    <div style="display: flex;">
      <el-date-picker
          style="width: 200px"
          v-model="dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD HH:mm:ss"
          :unlink-panels="true"
      />
      <el-input style="width:200px" type="text" placeholder="标题" v-model=searchForm.noteTitle clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="内容" v-model=searchForm.noteContent clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="标签" v-model=searchForm.noteTag clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>
    <div>
      <el-space wrap>
        <div v-for="(tag,index) in tagList" :key=tag>
          <el-check-tag :checked="checked[index]" @change="selectTag(index)">{{tag}}</el-check-tag>
        </div>
      </el-space>
    </div>


    <el-popconfirm title="您确定要删除选中的日记吗?" confirm-button-text="确定" cancel-button-text="取消"
                   @confirm="handleSelectedDelete">
      <template #reference>
        <el-button icon="Delete" style="border: none">删除</el-button>
      </template>
    </el-popconfirm>
    <div style="display: flex">
      <div>
        <el-table :data="notes" @selection-change="handleSelectionChange" @row-contextmenu="rightClick"
                  stripe>
          <el-table-column type="selection"></el-table-column>
          <el-table-column width="300" label="日记标题" prop="noteTitle">
            <template v-slot="scope">
              <el-link :href="'/note/info/'+scope.row.noteId" :underline="false">{{scope.row.noteTitle}}</el-link>
            </template>
          </el-table-column>
          <el-table-column width="300" label="标签" prop="noteTag">
            <template v-slot="scope">
              <el-space wrap>
                <div v-if="scope.row.noteTag!==''">
                  <el-tag v-for="tag in scope.row.noteTag.split(',')" :key=tag>
                    <el-button type="text" @click="toTag(tag)">{{ tag }}</el-button>
                  </el-tag>
                </div>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column width="300" label="日期" prop="noteDate">
            <template v-slot="scope">
              {{ parseTime(scope.row.noteDate, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column width="200px" align="center">
            <template #header>
              <span>操作</span>
            </template>
            <template v-slot="scope">
              <el-button type="primary" @click="toNoteInfo(scope.row.noteId)">修改</el-button>
              <el-popconfirm title="您确定要删除这项记录吗?" confirm-button-text="确定" cancel-button-text="取消"
                             @confirm="handleDelete(scope.row)">
                <template #reference>
                  <el-button type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
          <el-pagination
              v-model:currentPage="state.currentPage"
              v-model:page-size="state.pageSize"
              v-model:total="state.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
      </div>
      <div>
        <el-timeline>
          <el-timeline-item type="primary" :hollow=true v-for="note in notes" :key=note
                            :timestamp="parseTime(note.noteDate,'{y}-{m}-{d}')" placement="top">
            <el-card>
              <h4><el-link :href="'/note/info/'+note.noteId" :underline="false">{{note.noteTitle}}</el-link></h4>
              <el-space wrap>
                <div v-if="note.noteTag!==''">
                  <el-tag v-for="tag in note.noteTag.split(',')" :key="tag">
                    <el-button type="text" @click="toTag(tag)">{{ tag }}</el-button>
                  </el-tag>
                </div>
              </el-space>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </el-main>
</template>

<script>
import {ref, onMounted, reactive} from "vue";
import * as api from "@/api/note"
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

export default {
  name: "Diary",
  setup() {
    let menuVisible = ref(false)
    let currentRow = ref()
    const tagList = ref([])
    const checked=ref([])
    const state = reactive({
      noteId: '',
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10, // 分页大小
      multipleSelection: [],
      noteType: 'diary',
      selectedTag: [],
    })
    const router = useRouter()
    const notes = ref([])
    const dateRange = ref();
    const searchForm = reactive({
      start: '',
      end: '',
      noteTitle: '',
      noteContent: '',
      noteTag: '',
    })
    const getTagList=async ()=>{
      const res= await api.getTagList(state);
      if(res.data.code===200){
        tagList.value=res.data.data

      }
    }
    onMounted(() => {
      getNoteList()
      getTagList()
    })
    const getNoteList = async () => {
      const res = await api.getDiaryList(state);
      if (res.data.code === 200) {
        state.total = res.data.data.total
        notes.value = res.data.data.records
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true
        })
      }
    }
    const toNoteInfo = (val) => {
      router.push("/note/info/" + val)
    }
    const handleSelectionChange = (val) => {
      state.multipleSelection = val.map(v => v.noteId)
    }
    const handlePageChange = (val) => {
      state.currentPage = val
      getNoteList()
    }
    const handleSizeChange = (val) => {
      state.pageSize = val
      getNoteList()
    }
    const handleSelectedDelete = async () => {
      const res = await api.deleteSelected(state.multipleSelection);
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
      await getNoteList()
    }

    const handleDelete = async (val) => {
      const res = await api.deleteNote(val);
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
      await getNoteList()
    }

    const deleteNote = async (val) => {
      state.noteId = val
      const res = await api.deleteNote(state)
      if (res.data.code === 200) {
        ElMessage({
          type: 'success',
          message: res.data.msg,
          showClose: true
        })
      } else {
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
      await getNoteList();
    }

    const search = async () => {
      // if (dateRange.value === null) {
      //   searchForm.start = ''
      //   searchForm.end = ''
      // } else {
        searchForm.start = dateRange.value[0]
        searchForm.end = dateRange.value[1]
      // }
      console.log("1111111")
      const res = await api.searchDiary(searchForm)
      if (res.data.code === 200) {
        notes.value = res.data.data
      } else {
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
    }

    const toTag = async (val) => {
      searchForm.noteTag = val
      const res = await api.searchNote(searchForm)
      if (res.data.code === 200) {
        notes.value = res.data.data
      } else {
        ElMessage({
          type: 'error',
          message: res.data.msg,
          showClose: true
        })
      }
    }

    const parseTime = (time, pattern) => {
      if (arguments.length === 0 || !time) {
        console.warn("未传入正确的时间格式：new Date()!");
        return null;
      }
      const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
      let date;
      if (typeof time === "object") {
        date = time;
      } else {
        if ((typeof time === "string") && (/^[0-9]+$/.test(time))) {
          time = parseInt(time);
        } else if (typeof time === "string") {
          time = time.replace(new RegExp(/-/gm), "/");
        }
        if ((typeof time === "number") && (time.toString().length === 10)) {
          time = time * 1000;
        }
        date = new Date(time);
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      };
      return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        // Note: getDay() returns 0 on Sunday
        if (key === "a") {
          return ["日", "一", "二", "三", "四", "五", "六"][value];
        }
        if (result.length > 0 && value < 10) {
          value = "0" + value;
        }
        return value || 0;
      });
    }
    const rightClick = (row, column, event) => {
      menuVisible.value = false
      menuVisible.value = true
      event.preventDefault();
      let menu = document.querySelector("#rightMenu")
      document.addEventListener('click', closeMenu) // 给整个document添加监听鼠标事件，点击任何位置执行foo方法
      currentRow.value = row
      styleMenu(menu, event)
      event.preventDefault()
    }
    const closeMenu = () => {
      // 取消鼠标监听事件 菜单栏
      menuVisible.value = false
      document.removeEventListener('click', closeMenu)
    }
    const styleMenu = (menu, event) => {
      document.addEventListener("click", closeMenu); // 给整个document新增监听鼠标事件，点击任何位置执行foo方法
      if (event.clientX > 1800) {
        menu.style.left = event.clientX - 100 + 'px'
      } else {
        menu.style.left = event.clientX + 1 + 'px'
      }
      if (event.clientY > 700) {
        menu.style.top = event.clientY - 30 + 'px'
      } else {
        menu.style.top = event.clientY - 10 + 'px'
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
      const res=await api.searchDiaryByTag(state)
      if(res.data.code===200){
        notes.value=res.data.data
      }
    }
    return {
      state,
      notes,
      dateRange,
      searchForm,
      menuVisible,
      currentRow,
      tagList,
      checked,
      rightClick,
      closeMenu,
      toNoteInfo,
      handleDelete,
      handlePageChange,
      handleSizeChange,
      handleSelectionChange,
      handleSelectedDelete,
      search,
      toTag,
      parseTime,
      selectTag,
    }
  }
}
</script>

<style scoped>
.rightMenu {
  position: absolute;
  background-color: #fff;
  width: 100px;
  /*height: 106px;*/
  font-size: 12px;
  color: #444040;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  white-space: nowrap;
  z-index: 1000;
}
</style>

