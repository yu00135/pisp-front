<template>
  <el-main>
    <el-menu id="rightMenu" class="rightMenu" v-show="menuVisible" @mouseleave="closeMenu">
      <el-menu-item @click="handleEdit(currentRow)">编辑</el-menu-item>
      <el-menu-item @click="handleDelete(currentRow)">删除</el-menu-item>
    </el-menu>

    <div style="display: flex;">
      <el-input style="width:200px" type="text" placeholder="网站名称" v-model=searchForm.siteName clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="网址" v-model=searchForm.siteUrl clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="网站描述" v-model=searchForm.siteDescription clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="账号" v-model=searchForm.siteAccount clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="密码" v-model=searchForm.sitePassword clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>

    <div>
      <el-button icon="Plus" style="border: none" @click="handleAdd">添加</el-button>
      <el-popconfirm title="您确定要删除选中的网站吗?" confirm-button-text="确定" cancel-button-text="取消"
                     @confirm="handleSelectedDelete">
        <template #reference>
          <el-button icon="Delete" style="border: none">删除</el-button>
        </template>
      </el-popconfirm>
    </div>

    <el-table ref="tableRef" :data="tableData" @selection-change="handleSelectionChange" @row-contextmenu="rightClick"
              stripe>
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="siteName" label="网站名称" sortable="" width="120"></el-table-column>
      <el-table-column prop="siteUrl" label="网址">
        <template v-slot="scope">
          <el-link :href="scope.row.siteUrl" target="_blank" :underline="false"
                   rel="noopener noreferrer">{{ scope.row.siteUrl }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="siteDescription" label="网站描述"></el-table-column>
      <el-table-column prop="siteAccount" label="账号"></el-table-column>
      <el-table-column prop="sitePassword" label="密码"></el-table-column>
      <el-table-column width="200px" align="center">
        <template #header>
          <span>操作</span>
        </template>
        <template v-slot="scope">
          <el-button type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-popconfirm title="您确定要删除这项记录吗?" confirm-button-text="确定" cancel-button-text="取消"
                         @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div>
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
  </el-main>
  <el-dialog v-model="dialogFormVisible" :title="dialogType === 'add' ? '添加网站' : '修改网站'">
    <el-form :model="site" :rules="rules">
      <el-form-item label="网站名称" :label-width="100" prop="siteName">
        <el-input type="text" v-model="site.siteName"></el-input>
      </el-form-item>
      <el-form-item label="网址" :label-width="100" prop="siteUrl">
        <el-input type="text" v-model="site.siteUrl"></el-input>
      </el-form-item>
      <el-form-item label="网站描述" :label-width="100" prop="siteDescription">
        <el-input type="text" v-model="site.siteDescription"></el-input>
      </el-form-item>
      <el-form-item label="账号" :label-width="100" prop="siteDescription">
        <el-input type="text" v-model="site.siteAccount"></el-input>
      </el-form-item>
      <el-form-item label="密码" :label-width="100" prop="siteDescription">
        <el-input type="text" v-model="site.sitePassword"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addSite" v-if="dialogType==='add'">确定</el-button>
        <el-button type="primary" @click="editSite" v-if="dialogType==='edit'">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {defineComponent, onMounted, reactive, ref, toRefs} from "vue"
import * as api from "@/api/site"
import {ElMessage} from "element-plus"
import {decryptAes, encryptAes, encryptRsa} from "@/utils/encrypt";

export default defineComponent({
  name: "Site",
  setup() {
    let menuVisible = ref(false)
    let currentRow = ref()
    const tableRef = ref(null)
    let dialogFormVisible = ref(false)
    let dialogType = ref()
    let state = reactive({
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10, // 分页大小
      multipleSelection: []
    })

    let site = reactive({
      siteId: "",
      siteName: "",
      siteUrl: "",
      siteDescription: "",
      siteAccount: "",
      sitePassword: ""
    })

    const rules = {
      siteName: [
        {required: true, message: "请输入网站名称", trigger: "blur"},
      ],
      siteUrl: [
        {required: true, message: "请输入网址", trigger: "blur"},
      ],
    }

    const searchForm = reactive({
      siteName: "",
      siteUrl: "",
      siteDescription: "",
      siteAccount: "",
      sitePassword: "",
      currentPage: 1,
      pageSize: state.pageSize
    });

    const search = async () => {
      if(searchForm.sitePassword!==''){
        searchForm.sitePassword=encryptAes(searchForm.sitePassword)
      }
      const res = await api.search(searchForm)
      if (res.data.code === 200) {
        tableData.value = res.data.data.records
        tableData.value.forEach((item)=>{
          item.sitePassword=decryptAes(item.sitePassword)
        })
        searchForm.sitePassword=''
        state.currentPage = res.data.data.current
        state.pageSize = res.data.data.size
        state.total = res.data.data.total
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        });
      }
    }

    onMounted(() => {
      getSitePage()
    })

    let tableData = ref([])

    const getSitePage = async () => {
      const res = await api.getSitePage(state)
      if (res.data.code === 200) {
        state.total = res.data.data.total
        tableData.value = res.data.data.records
        tableData.value.forEach((item)=>{
          item.sitePassword=decryptAes(item.sitePassword)
        })
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        });
      }
    }

    const handleSelectionChange = (val) => {
      state.multipleSelection = val.map(v => v.siteId)
    }

    const handlePageChange = (val) => {
      state.currentPage = val
      getSitePage()
    }

    const handleSizeChange = (val) => {
      state.pageSize = val
      getSitePage()
    }

    const handleAdd = () => {
      site.siteId = ""
      site.siteName = ""
      site.siteUrl = ""
      site.siteDescription = ""
      site.siteAccount = ""
      site.sitePassword = ""
      dialogType.value = "add"
      dialogFormVisible.value = true
    }

    const handleSelectedDelete = async () => {
      const res = await api.deleteSelectedSite(state.multipleSelection);
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
      await getSitePage()
    }

    const handleEdit = (val) => {
      dialogType.value = "edit"
      dialogFormVisible.value = true
      site.siteId = val.siteId
      site.siteName = val.siteName
      site.siteUrl = val.siteUrl
      site.siteDescription = val.siteDescription
      site.siteAccount = val.siteAccount
      site.sitePassword = val.sitePassword
    }

    const addSite = async () => {
      site.sitePassword=encryptRsa(site.sitePassword)
      const res = await api.addSite(site);
      if (res.data.code === 200) {
        dialogFormVisible.value=false
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
      await getSitePage()
      dialogFormVisible.value = false
    }

    const editSite = async () => {
      site.sitePassword=encryptRsa(site.sitePassword)
      const res = await api.editSite(site);
      if (res.data.code === 200) {
        dialogFormVisible.value=false
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
      await getSitePage()
      dialogFormVisible.value = false
      menuVisible.value = false
    }

    const handleDelete = async (val) => {
      const res = await api.deleteSite(val);
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
      await getSitePage()
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
    return {
      menuVisible,
      tableRef,
      currentRow,
      state,
      site,
      rules,
      tableData,
      searchForm,
      dialogFormVisible,
      dialogType,
      closeMenu,
      rightClick,
      search,
      handlePageChange,
      handleSizeChange,
      handleSelectionChange,
      handleAdd,
      handleEdit,
      addSite,
      editSite,
      handleSelectedDelete,
      handleDelete,
    }

  }
})

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
