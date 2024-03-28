<template>
  <el-main>
    <el-menu id="rightMenu" class="rightMenu" v-show="menuVisible" @mouseleave="closeMenu">
      <el-menu-item v-if="currentRow.fileType==='folder'" @click="toFile(currentRow)">打开</el-menu-item>
      <el-menu-item @click="handleCopy">复制</el-menu-item>
      <el-menu-item @click="handleMove">移动</el-menu-item>
      <el-menu-item @click="handleRename(currentRow)">重命名</el-menu-item>
      <el-menu-item @click="handleDelete(currentRow)">删除</el-menu-item>
      <el-menu-item @click="download(currentRow)">下载</el-menu-item>
    </el-menu>

    <div style="display: flex;">
      <el-input style="width:200px" type="text" placeholder="文件名" v-model=searchForm.fileName clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>

    <div style="display: flex;align-items: center">
      文件空间:
      <el-progress
          style="width: 300px"
          :percentage=space.occupation/space.total*100
      >
        <span>{{byteToText(space.occupation)}} / {{byteToText(space.total)}}</span>
      </el-progress>
    </div>
    <div style="display: flex;">
      <el-upload action="/api/file/upload"
                 ref="uploadRef"
                 :data="uploadData"
                 :on-success="successUpload"
                 :limit="1"
                 :multiple="false"
                 :auto-upload="true"
      >
        <el-button icon="Upload" type="primary" style="margin-right: 10px">上传</el-button>
      </el-upload>
      <el-button icon="FolderAdd" @click="createFolder">新建文件夹</el-button>
      <el-button icon="Download" v-if="state.multipleSelection.length!==0" @click="downloadSelected">下载</el-button>
      <el-button icon="Delete" v-if="state.multipleSelection.length!==0" @click="handleSelectedDelete">删除</el-button>
      <el-button icon="DocumentCopy" v-if="state.multipleSelection.length!==0" @click="handleCopy">复制</el-button>
      <el-button icon="Rank" v-if="state.multipleSelection.length!==0" @click="handleMove">移动</el-button>
    </div>

    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item v-if="state.parentId!=='0'" :to="'/file/'+state.preId">返回上一级</el-breadcrumb-item>
      <el-breadcrumb-item :to="'/file/0'">全部文件</el-breadcrumb-item>
      <el-breadcrumb-item :to="'/file/'+item.fileId" v-for="item of state.fileList" :key="item">
        {{ item.fileName }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <el-table ref="tableRef" :data="tableData" @selection-change="handleSelectionChange" @row-contextmenu="rightClick"
              @row-click="handleRowClick"
              row-key="id">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="fileName" label="文件名" sortable="">
        <template v-slot="scope">
          <div v-if="scope.row.fileId===state.editId&&folderShow">
            <el-row>
              <el-col :span="2">
                <svg class="icon" aria-hidden="true">
                  <use v-bind:xlink:href=icon(scope.row.fileType)></use>
                </svg>
              </el-col>
              <el-col :span="18">
                <el-input type="text" v-model="scope.row.fileName"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" icon="Check" @click="addFolder(folder)" circle/>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" icon="Close" @click="cancelCreateFolder" circle/>
              </el-col>
            </el-row>
          </div>
          <div v-else-if="scope.row.fileId===state.editId">
            <el-row>
              <el-col :span="2">
                <svg class="icon" aria-hidden="true">
                  <use v-bind:xlink:href=icon(scope.row.fileType)></use>
                </svg>
              </el-col>
              <el-col :span="18">
                <el-input type="text" v-model="scope.row.fileName"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" icon="Check" @click="rename(scope.row)" circle/>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" icon="Close" @click="cancelRename(scope.row)" circle/>
              </el-col>
            </el-row>
          </div>
          <div v-else>
            <el-row>
              <el-col :span="2">
                <svg class="icon" aria-hidden="true">
                  <use v-bind:xlink:href=icon(scope.row.fileType)></use>
                </svg>
              </el-col>
              <el-col :span="22">
                <el-link :underline="false" @click="toFile(scope.row)">{{ scope.row.fileName }}</el-link>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="fileTime" label="修改时间" sortable=""></el-table-column>
      <el-table-column prop="fileSize" label="大小">
        <template v-slot="scope">
          <div v-if="scope.row.fileType!=='folder'&&scope.row.fileSize!==null">
            {{ byteToText(scope.row.fileSize) }}
          </div>
          <div v-else-if="scope.row.fileType==='folder'">
            -
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-main>

  <el-dialog v-model="dialogFormVisible" :title="dialogType === 'move' ? '移动到' : '复制到'">
    <el-breadcrumb :separator-icon="ArrowRight" style="padding: 2px">
      <el-breadcrumb-item v-if="moveState.parentId!==0" @click="toMoveFile(moveState.preId)" :to="1">返回上一级
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="toMoveFile(0)" :to="1">全部文件</el-breadcrumb-item>
      <el-breadcrumb-item @click="toMoveFile(item.fileId)" :to="1" v-for="item of moveState.fileList" :key="item">
        {{ item.fileName }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <el-table ref="tableRef" :data="dialogData" row-key="id" :show-header="false">
      <el-table-column prop="fileName" label="文件名" sortable="">
        <template v-slot="scope">
          <div>
            <el-row>
              <el-col :span="2">
                <svg class="icon" aria-hidden="true">
                  <use v-bind:xlink:href=icon(scope.row.fileType)></use>
                </svg>
              </el-col>
              <el-col :span="22">
                <el-link :underline="false" @click="toMoveFile(scope.row.fileId)">{{ scope.row.fileName }}</el-link>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="fileTime" label="修改时间" sortable=""></el-table-column>
      <el-table-column prop="fileSize" label="大小">
        <template v-slot="scope">
          <div v-if="scope.row.fileType!=='folder'&&scope.row.fileSize!==null">
            {{ byteToText(scope.row.fileSize) }}
          </div>
          <div v-else-if="scope.row.fileType==='folder'">
            -
          </div>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="move" v-if="dialogType==='move'">确定</el-button>
        <el-button type="primary" @click="copy" v-if="dialogType==='copy'">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {onMounted, reactive, ref, toRefs, watch} from "vue";
import * as api from "@/api/file";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";

export default {
  name: "File",
  setup() {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const folderShow = ref(false)
    const menuVisible = ref(false)
    let currentRow = ref()
    const tableRef = ref(null)
    let dialogFormVisible = ref(false)
    let dialogType = ref()
    let tableData = ref([])
    let breadcrumbData = ref([])
    const fileUrl=ref()
    const router = useRouter()
    const route = useRoute()

    const space=reactive({
      total: "",
      occupation: "",
      remaining: "",
    })

    const state = reactive({
      total: 0, // 总条数
      multipleSelection: [],
      parentId: route.params.id,
      preId: "",
      toId: "",
      editId: -1,
      fileList: []
    })

    let uploadData = reactive({
      parentId: route.params.id,
    })

    let file = ref({
      fileId: "",
      fileType: "",
      fileName: "",
      fileTime: "",
      fileSize: "",
      parentId: "",
    })

    let folder = reactive({
      fileId: 0,
      fileName: "",
      fileType: "folder",
      parentId: route.params.id,
    })

    const getSpace= async () => {
      const res=await api.getSpace()
      if(res.data.code===200){
        space.total=res.data.data.total
        space.occupation=res.data.data.occupation
        space.remaining=res.data.data.remaining
      }
    }

    const successUpload = async () => {
      ElMessage({
        message: "上传成功",
        type: "success",
        showClose: true,
      })
      await getFileList();
      await getSpace();
    }

    const getFileList = async () => {
      const res = await api.getFileList(state)
      if (res.data.code === 200) {
        tableData.value = res.data.data
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        })
      }
      const res1 = await api.getPath(state)
      if (res1.data.code === 200) {
        state.fileList = res1.data.data
      }
      if (state.parentId !== "0") {
        const res2 = await api.getParentId(state)
        if (res2.data.code === 200) {
          state.preId = res2.data.data
        }
      }
    }

    const toFile = (val) => {
      if (val.fileType === "folder") {
        router.push('/file/' + val.fileId)
      }else{
        fileUrl.value = 'http://127.0.0.1/'+user.userId+'/'+val.fileUuid+"."+val.fileType
        window.open(fileUrl.value)
      }
    }


    const dialogData = ref([])

    let moveState = reactive({
      fileId: 0,
      parentId: 0,
      preId: "",
      fileList: []
    })

    const toMoveFile = async (val) => {
      moveState.parentId = val
      state.toId = val
      const res = await api.getFolderList(moveState)
      if (res.data.code === 200) {
        dialogData.value = res.data.data
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        })
      }
      const res1 = await api.getPath(moveState)
      if (res1.data.code === 200) {
        moveState.fileList = res1.data.data
      }
      if (moveState.parentId !== "0") {
        const res2 = await api.getParentId(moveState)
        if (res2.data.code === 200) {
          moveState.preId = res2.data.data
        }
      }
    }

    onMounted(() => {
      getFileList()
      getSpace()
    })

    watch(
        () => route.params.id,
        (n, o) => {
          console.log(n)
          if (route.name === 'file') {
            state.parentId = n
            uploadData.parentId = n
            folder.parentId = n
            searchForm.parentId = n
            getFileList()
          }
        })

    const handleSelectionChange = (val) => {
      state.multipleSelection = val.map(v => v.fileId)
    }
    const handleSelectedDelete = async () => {
      const res = await api.deleteSelectedFile(state.multipleSelection);
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
      await getFileList()
    }

    const handleDelete = async (val) => {
      const res = await api.deleteFile(val);
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
      await getFileList()
    }

    const deleteFile = async (val) => {
      const res = await api.deleteFile(val);
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
      await getFileList()
    }
    const handleEdit = (val) => {
      val.show = true;
    }

    const createFolder = () => {
      if (state.editId !== 0) {
        folderShow.value = true
        tableData.value.unshift(folder)
        state.editId = 0
      }
    }
    const cancelCreateFolder = () => {
      folderShow.value = false
      tableData.value.shift()
      state.editId = -1
    }

    const addFolder = async (val) => {
      const reg = new RegExp('[\\\\/:*?"<>|]');
      if (reg.test(val.fileName)) {
        ElMessage({
          message: "文件名不能包含以下字符\\/:*？\"<>|",
          type: "error",
          showClose: true,
        })
        return false
      } else if (val.fileName === '') {
        ElMessage({
          message: "文件夹名不能为空",
          type: "error",
          showClose: true,
        });
        return false
      }
      const res = await api.createFolder(val)
      if (res.data.code !== 200) {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        });
      }
      state.editId = -1
      await getFileList()
    }

    const handleMove = () => {
      moveState.fileId = 0
      moveState.parentId = 0
      moveState.preId = ""
      moveState.fileList = []
      toMoveFile(0)
      dialogType.value = "move"
      dialogFormVisible.value = true
    }

    const move = async () => {
      dialogFormVisible.value = false
      const res = await api.move(state)
      if (res.data.code === 200) {
        ElMessage({
          message: res.data.msg,
          type: "success",
          showClose: true,
        })
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        })
      }
      getFileList()
    }

    const handleCopy = () => {
      moveState.fileId = 0
      moveState.parentId = 0
      moveState.preId = ""
      moveState.fileList = []
      toMoveFile(0)
      dialogType.value = "copy"
      dialogFormVisible.value = true
    }

    const copy = async () => {
      dialogFormVisible.value = false
      const res = await api.copy(state)
      if (res.data.code === 200) {
        ElMessage({
          message: res.data.msg,
          type: "success",
          showClose: true,
        })
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        })
      }
    }

    const handleRename = (val) => {
      state.editId = val.fileId
      file.value.fileName = val.fileName
    }
    const cancelRename = (val) => {
      state.editId = -1
      val.fileName = file.value.fileName
    }
    const rename = async (val) => {
      const reg = new RegExp('[\\\\/:*?"<>|]');
      if (reg.test(val.fileName)) {
        ElMessage({
          message: "文件名不能包含以下字符\\/:*？\"<>|",
          type: "error",
          showClose: true,
        })
        return false
      } else if (val.fileName === '') {
        ElMessage({
          message: "文件夹名不能为空",
          type: "error",
          showClose: true,
        });
        return false
      }
      const res = await api.rename(val);
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
      state.editId = -1
      await getFileList()
    }

    const download = (val) => {
      window.location.href = "http://localhost:8080/file/download/" + val.fileId
    }

    const downloadSelected = () => {
      // for(let i=0;i<state.multipleSelection.length;i++){
      //   window.location.href = "http://localhost:8080/file/download/"+state.multipleSelection[i]
      // }
      for (let i = 0; i < state.multipleSelection.length; i++) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none"; // 防止影响页面
        iframe.style.height = 0; // 防止影响页面
        iframe.src = "http://localhost:8080/file/download/" + state.multipleSelection[i];
        document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
        // 5分钟之后删除
        setTimeout(() => {
          iframe.remove();
        }, 5 * 1000);
      }

    }

    const handleRowClick = (row) => {
      tableRef.value.toggleRowSelection(row, undefined)
    }

    const rightClick = (row, column, event) => {
      state.multipleSelection.forEach((item)=>{
        if(item===row.fileId){
          tableRef.value.toggleRowSelection(row, undefined)
        }
      })
      tableRef.value.toggleRowSelection(row, undefined)
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
    const icon = (val) => {
      let name = ""
      switch (val) {
        case 'folder':
          name = "#icon-folder"
          break;
        case 'txt':
          name = "#icon-txt"
          break;
        case 'ppt':
          name = "#icon-ppt"
          break;
        case 'excel':
          name = "#icon-excel"
          break;
        case 'word':
          name = "#icon-word"
          break;
        case 'video':
        case 'mp4':
          name = "#icon-video"
          break;
        case 'picture':
        case 'png':
        case 'jpg':
          name = "#icon-picture"
          break;
        case 'zip':
          name = "#icon-zip"
          break;
        case 'pdf':
          name = "#icon-pdf"
          break;
        case 'wav':
        case 'mp3':
          name = "#icon-wav"
          break;
        case 'torrent':
          name = "#icon-torrent"
          break;
        default:
          name = '#icon-file'
          break;
      }
      return name
    }
    const byteToText = (size) => {
      let gb = Math.floor(size / (1024 * 1024 * 1024))
      let mb = Math.floor(size / (1024 * 1024))
      let kb = Math.floor(size / 1024)

      if (gb > 0) {
        return (size / (1024 * 1024 * 1024).toFixed(2)) + "GB"
      } else if (mb > 0) {
        return (size / (1024 * 1024)).toFixed(2) + "MB";
      } else if (kb > 0) {
        return (size / 1024).toFixed(2) + "KB";
      } else {
        return size.toFixed(2) + "B";
      }
    }
    const searchForm=reactive({
      fileName: '',
      parentId: 0
    })
    const search=async ()=>{
      const res=await api.search(searchForm);
      if(res.data.code===200){
        tableData.value=res.data.data
      }else{
        ElMessage({
          message:res.data.msg,
          type:"error",
          showClose:true
        })
      }
    }
    return {
      state,
      moveState,
      menuVisible,
      tableRef,
      currentRow,
      fileUrl,
      ...toRefs(state),
      ...toRefs(moveState),
      file,
      folder,
      folderShow,
      tableData,
      uploadData,
      breadcrumbData,
      dialogFormVisible,
      dialogType,
      dialogData,
      route,
      router,
      searchForm,
      space,
      successUpload,
      handleRowClick,
      rightClick,
      closeMenu,
      handleRename,
      cancelRename,
      rename,
      download,
      downloadSelected,
      handleSelectionChange,
      handleEdit,
      handleMove,
      move,
      handleCopy,
      copy,
      handleSelectedDelete,
      handleDelete,
      deleteFile,
      createFolder,
      cancelCreateFolder,
      addFolder,
      toFile,
      toMoveFile,
      getFileList,
      icon,
      byteToText,
      search,
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

.icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.25em;
  fill: currentColor;
  overflow: hidden;
}
</style>
