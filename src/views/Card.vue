<template>
  <el-main>
    <el-menu id="rightMenu" class="rightMenu" v-show="menuVisible" @mouseleave="closeMenu">
      <el-menu-item @click="handleEdit(currentRow)">编辑</el-menu-item>
      <el-menu-item @click="handleDelete(currentRow)">删除</el-menu-item>
    </el-menu>

    <div style="display: flex;">
      <el-input style="width:200px" type="text" placeholder="卡片名称" v-model=searchForm.cardName clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="卡片编号" v-model=searchForm.cardNumber clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="卡片密码" v-model=searchForm.cardPassword clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>

    <el-button icon="Plus" style="border: none" @click="handleAdd">添加</el-button>
    <el-popconfirm title="您确定要删除选中的卡片吗?" confirm-button-text="确定" cancel-button-text="取消"
                   @confirm="handleSelectedDelete">
      <template #reference>
        <el-button icon="Delete" style="border: none">删除</el-button>
      </template>
    </el-popconfirm>

    <el-table ref="tableRef" :data="tableData" @selection-change="handleSelectionChange" @row-contextmenu="rightClick"
              stripe>
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="cardName" label="卡片名称" sortable=""></el-table-column>
      <el-table-column prop="cardNumber" label="卡片编号"></el-table-column>
      <el-table-column prop="cardPassword" label="卡片密码"></el-table-column>
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
  <el-dialog v-model="dialogFormVisible" :title="dialogType === 'add' ? '添加卡片' : '修改卡片'">
    <el-form :model="card" :rules="rules">
      <el-form-item label="卡片名称" :label-width="100" prop="cardName">
        <el-input type="text" v-model="card.cardName"></el-input>
      </el-form-item>
      <el-form-item label="卡片编号" :label-width="100" prop="cardNumber">
        <el-input type="text" v-model="card.cardNumber"></el-input>
      </el-form-item>
      <el-form-item label="卡片密码" :label-width="100" prop="cardPassword">
        <el-input type="text" v-model="card.cardPassword"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addCard" v-if="dialogType==='add'">确定</el-button>
        <el-button type="primary" @click="editCard" v-if="dialogType==='edit'">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {defineComponent, reactive, ref, onMounted} from "vue"
import * as api from "@/api/card"
import {ElMessage} from "element-plus"
import {decryptAes, encryptAes, encryptRsa} from "@/utils/encrypt";

export default defineComponent({
  name: "Card",
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

    let card = reactive({
      cardId: "",
      cardName: "",
      cardNumber: "",
      cardPassword: "",
    })

    const rules = {
      cardName: [
        {required: true, message: "请输入卡片名称", trigger: "blur"},
      ],
      cardNumber: [
        {required: true, message: "请输入卡片编号", trigger: "blur"},
      ],
    }


    let searchForm = reactive({
      cardName: "",
      cardNumber: "",
      cardPassword: "",
      currentPage: 1,
      pageSize: state.pageSize
    })

    const search = async () => {
      if(searchForm.cardPassword!==''){
        searchForm.cardPassword=encryptAes(searchForm.cardPassword)
      }
      const res = await api.search(searchForm)
      if (res.data.code === 200) {
        tableData.value = res.data.data.records
        tableData.value.forEach((item)=>{
          item.cardPassword=decryptAes(item.cardPassword)
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
      getCardPage()
    })

    let tableData = ref([])

    const getCardPage = async () => {
      const res = await api.getCardPage(state)
      if (res.data.code === 200) {
        state.total = res.data.data.total
        tableData.value = res.data.data.records
        tableData.value.forEach((item)=>{
          item.cardPassword=decryptAes(item.cardPassword)
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
      state.multipleSelection = val.map(v => v.cardId)
    }

    const handlePageChange = (val) => {
      state.currentPage = val
      getCardPage()
    }

    const handleSizeChange = (val) => {
      state.pageSize = val
      getCardPage()
    }

    const handleAdd = () => {
      card.cardId = ""
      card.cardName = ""
      card.cardNumber = ""
      card.cardPassword = ""
      dialogType.value = "add"
      dialogFormVisible.value = true
    }

    const handleSelectedDelete = async () => {
      const res = await api.deleteSelectedCard(state.multipleSelection);
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
      await getCardPage()
    }

    const handleEdit = (val) => {
      dialogType.value = "edit"
      dialogFormVisible.value = true
      card.cardId = val.cardId
      card.cardName = val.cardName
      card.cardNumber = val.cardNumber
      card.cardPassword = val.cardPassword
    }

    const addCard = async () => {
      card.cardPassword=encryptRsa(card.cardPassword)
      const res = await api.addCard(card);
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
      await getCardPage()
      dialogFormVisible.value = false
    }

    const editCard = async () => {
      card.cardPassword=encryptRsa(card.cardPassword)
      const res = await api.editCard(card);
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
      await getCardPage()
      dialogFormVisible.value = false
      menuVisible.value = false
    }

    const handleDelete = async (val) => {
      const res = await api.deleteCard(val);
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
      await getCardPage()
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
      card,
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
      addCard,
      editCard,
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
