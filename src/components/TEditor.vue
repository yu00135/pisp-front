<template>
  <div class="tinymce-box">
    <Editor
        :id="editorsId"
        v-model="content"
        :init="init"
        tag-name="div"
        :disabled="disabled"
        @onClick="onClick"
    />
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default'
import 'tinymce/models/dom'

// 更多插件参考：https://www.tiny.cloud/docs/plugins/

import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/help'
import 'tinymce/plugins/image'
import 'tinymce/plugins/importcss'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/quickbars'
import 'tinymce/plugins/save'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/template'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/wordcount'

import {ref, watch, onMounted} from 'vue';

export default {
  name: "TEditor",
  components: {Editor},
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      //default: 'lists image media table wordcount save preview'
      // 插件需要import进来
      default: 'wordcount visualchars visualblocks template searchreplace save quickbars ' +
          'preview  pagebreak nonbreaking media insertdatetime importcss image   ' +
          'kityformula-editor help fullscreen directionality codesample code charmap link code table lists advlist ' +
          'anchor autolink autoresize autosave emoticons'
    },
    toolbar: {
      type: [String, Array],
      // default: 'undo redo |  formatselect | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | lists image media table | codesample code removeformat save preview'
      default: 'formats undo redo cut paste print fontsizeselect fontselect template|wordcount ltr rtl visualchars ' +
          'visualblocks spellchecker searchreplace|save preview pagebreak nonbreaking|media image|outdent indent aligncenter ' +
          'alignleft alignright alignjustify lineheight  underline quicklink h2 h3 blockquote numlist bullist table ' +
          'kityformula-editor removeformat forecolor backcolor bold italic  strikethrough hr charmap link insertdatetime' +
          '|subscript superscript codesample code |anchor fullscreen| emoticons help'
    },
    height: {
      type: Number,
      default: 800,
    },
  },
  emits: {'update:modelValue': null},
  setup(props, context) {
    let editorsId = "edit" + new Date().getTime()    //防止动态组件v-if 第二次加载无效化。要做动态id
    const init = {
      height: props.height,
      language_url: '/tinymce/langs/zh_CN.js',
      language: 'zh_CN',
      // 皮肤：这里引入的是public下的资源文件
      skin_url: '/tinymce/skins/ui/oxide',
      // skin_url: 'tinymce/skins/ui/oxide-dark',//黑色系
      emoticons_database_url: '/emojis.js',
      plugins: props.plugins,
      toolbar: props.toolbar,
      toolbar_mode: 'sliding',
      menubar: true,
      placeholder: '在这里输入文字',
      branding: false, //tiny技术支持信息是否显示
      resize: false, //编辑器宽高是否可变，false-否,true-高可变，'both'-宽高均可，注意引号
      // 是否显示底部状态栏
      statusbar: true,
      elementpath: true, //元素路径是否显示
      content_style: 'img {max-width:100%;}', //直接自定义可编辑区域的css样式
      content_css: '/tinymce/skins/content/default/content.min.css',  //以css文件方式自定义可编辑区域的css样式，css文件需自己创建并引入
      convert_urls: false,
      external_plugins: {
        'kityformula-editor': '/tinymce/plugins/kityformula-editor/plugin.js'
      },
      image_title: true,
      paste_data_images: true,
      images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', '/api/note/uploadImage');
        xhr.upload.onprogress = (e) => {
          progress(e.loaded / e.total * 100);
        };
        xhr.onload = () => {
          if (xhr.status === 403) {
            reject({message: 'HTTP Error: ' + xhr.status, remove: true});
            return;
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject('HTTP Error: ' + xhr.status);
            return;
          }
          const json = JSON.parse(xhr.responseText);
          if (!json || typeof json.location != 'string') {
            reject('Invalid JSON: ' + xhr.responseText);
            return;
          }
          resolve(json.location);
        };
        xhr.onerror = () => {
          reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
        };
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        xhr.send(formData);
      }),
      file_picker_types: 'file image media',
      file_picker_callback: function (callback, value, meta) {
        let filetype = '.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4'
        let url = ''
        switch (meta.filetype) {
          case 'image':
            filetype = '.jpg, .jpeg, .png, .gif'
            url = '/api/note/uploadImage'
            break;
          case 'media':
            filetype = '.flac,.mp3, .mp4';
            url = '/api/note/uploadMedia'
            break;
          case 'file':
          default:
        }
        if (meta.filetype === 'image') {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', filetype);
          input.click();
          input.onchange = function () {
            const file = this.files[0];
            let xhr, formData;
            console.log(file.name);
            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', url);
            xhr.onload = function () {
              let json;
              if (xhr.status !== 200) {
                return
              }
              json = JSON.parse(xhr.responseText);
              if (!json || typeof json.location != 'string') {
                return
              }
              callback(json.location);
            }
            formData = new FormData();
            formData.append('file', file, file.name);
            xhr.send(formData);
          }
        }
        if (meta.filetype === "media" || meta.filetype === "audio") {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', filetype);
          input.click();
          input.onchange = function () {
            const file = this.files[0];
            let xhr, formData;
            console.log(file.name);
            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', url);
            xhr.onload = function () {
              let json;
              if (xhr.status !== 200) {
                return
              }
              json = JSON.parse(xhr.responseText);
              if (!json || typeof json.location != 'string') {
                return
              }
              callback(json.location);
            }
            formData = new FormData();
            formData.append('file', file, file.name);
            xhr.send(formData);
          }
        }
      }
    }
    tinymce.init; // 初始化

    const revert_data = content => {
      context.emit('update:modelValue', content);
    };
// 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
// 需要什么事件可以自己增加
    function onClick(e) {
      this.$emit('onClick', e, tinymce);
    }

// 可以添加一些自己的自定义事件，如清空内容
    function clear() {
      this.contentValue = '';
    }

    const setEditMode = type => {
      tinymce.editors[editorsId].setMode(type); //开启只读模式
    };
    const content = ref(props.modelValue);
    watch(
        () => props.modelValue,
        (initInfo, prevInitInfo) => {
          content.value = props.modelValue;
        },
    );
    watch(
        () => content.value,
        (initInfo, prevInitInfo) => {
          revert_data(content);
        },
    );
    onMounted(() => {
      // readonly();
    });
    return {
      editorsId,
      content,
      init,
      revert_data,
      onClick,
      clear,
      setEditMode,
      // contentValue: this.value,
    };
  },
// data() {
//   return {
//     content: this.modelValue,
//   };
// },

  mounted() {
  }
  ,
// watch: {
//   content() {
//     this.revert_data(this.content);
//   },
// },
}
;
</script>

<style scoped>

</style>
