<template>
  <el-main>
    <el-card>
      <div>
        <el-button v-if="note.noteType==='note'" icon="ArrowLeft" @click="toNote">返回笔记列表</el-button>
        <el-button v-else-if="note.noteType==='diary'" icon="ArrowLeft" @click="toDiary">返回日记列表</el-button>
      </div>
      笔记类型
      <br/>
      <el-select v-model="note.noteType">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <br/>
      标签
      <br/>
      <el-tag v-for="tag in note.noteTag" :key="tag" size="large" closable :disable-transitions="false"
              @close="handleClose(tag)">{{ tag }}
      </el-tag>
      <el-input v-if="inputTagVisible" ref="inputRef" v-model="tag" class="ml-1 w-20" size="small"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"/>
      <el-button v-else class="button-new-tag" @click="showInput">+ New Tag</el-button>
      <br/>
      标题
      <el-input type="text" v-model='note.noteTitle' placeholder="请输入标题"></el-input>
      <div v-if="note.noteType==='diary'">
        日期
        <br/>
        <el-date-picker v-model="note.noteDate" type="date" format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择日期"></el-date-picker>
        <br/>
      </div>
      内容
      <TEditor ref="editorRef" v-model:modelValue="note.noteContent"></TEditor>
      <el-button @click="reset">重置内容</el-button>
      <el-button @click="edit">确定</el-button>
    </el-card>
  </el-main>
</template>

<script>
import TEditor from "@/components/TEditor"
import * as api from "@/api/note"
import {ElMessage} from "element-plus";
import {ref, reactive, nextTick, onMounted} from 'vue'
import {useRoute, useRouter} from "vue-router";

export default {
  name: "NoteInfo",
  components: {TEditor},
  setup() {
    const tag = ref('')
    const inputTagVisible = ref(false)
    const inputRef = ref()
    const router = useRouter()
    const route = useRoute()
    const state = reactive({
      noteId: route.params.id,
    })
    const note = reactive({
      noteId: route.params.id,
      noteTitle: '',
      noteContent: '',
      noteDate: '',
      noteType: '',
      noteTag: [],
    })
    const getNote = async () => {
      const res = await api.getNoteByNoteId(state)
      if (res.data.code === 200) {
        note.noteTitle = res.data.data.noteTitle
        note.noteContent = res.data.data.noteContent
        note.noteType = res.data.data.noteType
        if (note.noteType === 'diary') {
          note.noteDate = res.data.data.noteDate
        }
        note.noteTag = res.data.data.noteTag.split(",")
        if (note.noteTag[0] === '') {
          note.noteTag.shift()
        }
      }
    }
    onMounted(() => {
      getNote()
    })
    const handleClose = (tag) => {
      note.noteTag.splice(note.noteTag.indexOf(tag), 1)
    }
    const showInput = () => {
      inputTagVisible.value = true
      nextTick(() => {
        inputRef.value.input.focus()
      })
    }
    const handleInputConfirm = () => {
      note.noteTag.forEach((val) => {
        if (val === tag.value) {
          ElMessage({
            message: "标签重复",
            type: "error",
            showClose: true
          })
          inputTagVisible.value = false
          tag.value = ''
        }
      })
      if (tag.value) {
        note.noteTag.push(tag.value)
      }
      inputTagVisible.value = false
      tag.value = ''
    }

    const options = [
      {
        value: 'note',
        label: '笔记',
      },
      {
        value: 'diary',
        label: '日记',
      }
    ]
    const reset = () => {
      note.noteContent = ""
    }

    const edit = async () => {
      note.noteDate=parseTime(note.noteDate,'{y}-{m}-{d} {h}:{i}:{s}')
      const res = await api.edit(note)
      if (res.data.code === 200) {
        ElMessage({
          message: res.data.msg,
          type: "success",
          showClose: true
        })
      } else {
        ElMessage({
          message: res.data.msg,
          type: "error",
          showClose: true
        })
      }
    }
    const toNote = () => {
      router.push('/Note')
    }
    const toDiary = () => {
      router.push('/Diary')
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
    return {
      state,
      tag,
      inputRef,
      inputTagVisible,
      options,
      note,
      reset,
      edit,
      handleClose,
      showInput,
      handleInputConfirm,
      toNote,
      toDiary
    }
  }
}
</script>

<style scoped>

</style>
