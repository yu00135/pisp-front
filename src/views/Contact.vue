<template>
  <el-main>
    <el-menu id="rightMenu" class="rightMenu" v-show="menuVisible" @mouseleave="closeMenu">
      <el-menu-item @click="handleEdit(currentRow)">编辑</el-menu-item>
      <el-menu-item @click="handleDelete(currentRow)">删除</el-menu-item>
    </el-menu>

    <div style="display: flex;align-items: center">
      <el-input style="width:200px" type="text" placeholder="联系人名称" v-model=searchForm.contactName clearable></el-input>
      <el-select v-model="searchForm.contactGender">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-input style="width:200px" type="text" placeholder="手机号" v-model=searchForm.contactPhone clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="电子邮箱" v-model=searchForm.contactEmail clearable></el-input>
      <el-input style="width:200px" type="text" placeholder="地址" v-model=searchForm.contactAddress clearable></el-input>
      <el-button icon="Search" type="primary" @click="search(searchForm)">搜索</el-button>
    </div>

    <div>
      <el-button icon="Plus" style="border: none" @click="handleAdd">添加</el-button>
      <el-popconfirm title="您确定要删除选中的联系人吗?" confirm-button-text="确定" cancel-button-text="取消"
                     @confirm="handleSelectedDelete">
        <template #reference>
          <el-button icon="Delete" style="border: none">删除</el-button>
        </template>
      </el-popconfirm>
    </div>

    <el-table ref="tableRef" :data="tableData" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="contactName" label="联系人名称" width="200" sortable=""></el-table-column>
      <el-table-column prop="contactGender" label="性别" width="200"></el-table-column>
      <el-table-column prop="contactPhone" label="手机号"></el-table-column>
      <el-table-column prop="contactEmail" label="电子邮箱"></el-table-column>
      <el-table-column prop="contactAddress" label="地址"></el-table-column>
      <el-table-column align="center">
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
  <el-dialog v-model="dialogFormVisible" :title="dialogType === 'add' ? '添加联系人' : '修改联系人'">
    <el-form :model="contact" :rules="rules">
      <el-form-item label="联系人名称" :label-width="100" prop="contactName">
        <el-input type="text" v-model="contact.contactName"></el-input>
      </el-form-item>
      <el-form-item label="性别" :label-width="100" prop="contactGender">
        <el-select v-model="contact.contactGender">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" :label-width="100" prop="contactPhone">
        <el-input type="text" v-model="contact.contactPhone"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" :label-width="100" prop="contactEmail">
        <el-input type="text" v-model="contact.contactEmail"></el-input>
      </el-form-item>
      <el-form-item label="地址" :label-width="100" prop="contactAddress">
        <el-input type="text" v-model="contact.contactAddress"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addContact" v-if="dialogType==='add'">确定</el-button>
        <el-button type="primary" @click="editContact" v-if="dialogType==='edit'">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {defineComponent, reactive, ref, onMounted} from "vue"
import * as api from "@/api/contact"
import {ElMessage} from "element-plus"

export default defineComponent({
  name: "Contact",
  setup() {
    let menuVisible = ref(false)
    let currentRow = ref()
    const tableRef = ref(null)
    const options = [
      {
        value: '男',
        label: '男',
      },
      {
        value: '女',
        label: '女',
      }
    ]

    let state = reactive({
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10, // 分页大小
      multipleSelection: []
    })

    let contact = reactive({
      contactId: "",
      contactName: "",
      contactGender: "",
      contactPhone: "",
      contactEmail: "",
      contactAddress: "",
    })

    let dialogFormVisible = ref(false)

    let dialogType = ref()

    const rules = {
      contactName: [
        {required: true, message: "请输入联系人姓名", trigger: "blur"},
      ],
      contactPhone: [
        {
          validator: (rule, value, callback) => {
            const key = /^1[34578]\d{9}$/
            if (value.length === 0)
              callback()
            if (key.test(value) === false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback()
            }
          },
          trigger: "blur"
        }
      ],
      contactEmail: [
        {
          validator: (rule, value, callback) => {
            const key = /^\w{1,64}@[a-z0-9]{1,256}(\.[a-z]{2,6}){1,2}$/i
            if (value.length === 0)
              callback()
            if (key.test(value) === false) {
              callback(new Error("邮箱格式错误"));
            } else {
              callback()
            }
          },
          trigger: "blur",
        }
      ]
    }

    let searchForm = reactive({
      contactName: "",
      contactGender: "",
      contactPhone: "",
      contactEmail: "",
      contactAddress: "",
      currentPage: 1,
      pageSize: state.pageSize
    })

    const search = async () => {
      const res = await api.search(searchForm)
      if (res.data.code === 200) {
        tableData.value = res.data.data.records
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
      getContactPage()
    })

    let tableData = ref([])

    const getContactPage = async () => {
      const res = await api.getContactPage(state)
      if (res.data.code === 200) {
        state.total = res.data.data.total
        tableData.value = res.data.data.records
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true,
        });
      }
    }

    const handleSelectionChange = (val) => {
      state.multipleSelection = val.map(v => v.contactId)
    }

    const handlePageChange = (val) => {
      state.currentPage = val
      getContactPage()
    }

    const handleSizeChange = (val) => {
      state.pageSize = val
      getContactPage()
    }

    const handleAdd = () => {
      contact.contactId = ""
      contact.contactName = ""
      contact.contactGender = ""
      contact.contactPhone = ""
      contact.contactEmail = ""
      contact.contactAddress = ""
      dialogType.value = "add"
      dialogFormVisible.value = true
    }

    const handleSelectedDelete = async () => {
      const res = await api.deleteSelectedContact(state.multipleSelection);
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
      await getContactPage()
    }

    const handleEdit = (val) => {
      dialogType.value = "edit"
      dialogFormVisible.value = true
      contact.contactId = val.contactId
      contact.contactName = val.contactName
      contact.contactGender = val.contactGender
      contact.contactPhone = val.contactPhone
      contact.contactEmail = val.contactEmail
      contact.contactAddress = val.contactAddress
    }
    const addContact = async () => {
      const res = await api.addContact(contact);
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
      await getContactPage()
      dialogFormVisible.value = false
    }

    const editContact = async () => {
      const res = await api.editContact(contact);
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
      await getContactPage()
      dialogFormVisible.value = false
      menuVisible.value = false
    }

    const handleDelete = async (val) => {
      const res = await api.deleteContact(val);
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
      await getContactPage()
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
      currentRow,
      tableRef,
      state,
      options,
      contact,
      rules,
      tableData,
      searchForm,
      dialogFormVisible,
      dialogType,
      rightClick,
      closeMenu,
      search,
      handlePageChange,
      handleSizeChange,
      handleSelectionChange,
      handleAdd,
      handleEdit,
      addContact,
      editContact,
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
