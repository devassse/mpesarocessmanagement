<template>
  <q-btn
    align="left"
    class="q-pl-none q-mr-md"
    flat
    size="md"
    unelevated
    color="secondary"
    label="Edit"
    @click="open('bottom')"
  />
  <q-file
    standout
    style="width: 200px"
    accept=".bpmn"
    color="secondary"
    dense
    filled
    v-model="model"
    label="UPLOAD FILE"
  >
    <template v-slot:prepend>
      <q-icon name="cloud_upload" />
    </template>
  </q-file>

  <q-dialog v-model="dialog" full-width position="bottom">
    <q-card style="width: 100vw">
      <q-card-section>
        <div class="text-overline text-secondary">
          Edit Your text content and subtitle
        </div>
        <div class="cursor-pointer text-h6 q-mt-sm q-mb-xs text-negative">
          {{ label != '' ? label : '......' }} <!-- Validate empty Field - if empty put just dots, 'cause when its empty, the Field desapier' -->
          <q-popup-edit v-model="label" auto-save v-slot="scope">
            <q-input
              v-model="scope.value"
              dense
              autofocus
              counter
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </div>
      </q-card-section>
      <q-linear-progress :value="1" color="secondary" />
      <div ref="editorContainer" :class="{ 'fullscreen-editor': isFullscreen }">
      <q-editor
       :class="{ fullscreen: isFullscreen }"
        v-model="qeditor"
        :dense="$q.screen.lt.md"
        :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify']
            },
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              options: ['left', 'center', 'right', 'justify']
            }
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['print',],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: [
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'code'
              ]
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7'
              ]
            },
            {
              label: $q.lang.editor.defaultFont,
              icon: $q.iconSet.editor.font,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'default_font',
                'arial',
                'arial_black',
                'comic_sans',
                'courier_new',
                'impact',
                'lucida_grande',
                'times_new_roman',
                'verdana'
              ]
            },
            'removeFormat'
          ],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
          ['undo', 'redo'],
          ['viewsource'],
          ['insertTable', 'deleteTable'],
          ['textColor', 'insertImage', 'deleteImage','fullscreenn']
        ]"
        :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana'
        }"
        :definitions="{
          insertTable: {
            label: 'Insert Table',
            icon: 'table_chart',
            handler: openTableDialog,
          },
          deleteTable: {
            label: 'Delete Table',
            icon: 'delete',
            handler: deleteTable,
          },
          textColor: {
            label: 'Text Color',
            icon: 'format_color_text',
            handler: openColorPicker,
          },
          insertImage: {
            label: 'Insert Image',
            icon: 'image',
            handler: openImageDialog,
          },
          deleteImage: {
            label: 'Delete Image',
            icon: 'delete_outline',
            handler: deleteImage,
          },
          fullscreenn: {
            label: isFullscreen.value ? 'Exit Fullscreen' : 'Fullscreen',
            icon: isFullscreen.value ? 'fullscreen_exit' : 'fullscreen',
            handler: toggleFullscreen,
          }
        }"
      />
    </div>

    </q-card>
  </q-dialog>

  <!-- Table Creator Dialog -->
  <q-dialog v-model="tableDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Create Table</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model.number="rows" type="number" label="Rows" min="1" />
        <q-input
          v-model.number="cols"
          type="number"
          label="Columns"
          min="1"
          class="q-mt-md"
        />
        <q-checkbox
          v-model="includeHeader"
          label="Include header row"
          class="q-mt-sm"
        />
        <q-checkbox
          v-model="includeFooter"
          label="Include footer row"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Create" color="primary" @click="createTable" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Color Picker Dialog -->
  <q-dialog v-model="colorPickerDialog">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Choose Text Color</div>
      </q-card-section>

      <q-card-section>
        <q-color v-model="selectedColor" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Apply" color="secondary" @click="applyTextColor" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Image Insertion Dialog -->
  <q-dialog v-model="imageDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Insert Image</div>
      </q-card-section>

      <q-card-section>
        <q-file v-model="imageFile" label="Or upload an image" accept="image/*">
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <!-- Inputs for Image Width and Height -->
        <q-input
          v-model="imageWidth"
          label="Image Width (px)"
          type="number"
          min="1"
          class="q-mt-md"
        />
        <q-input
          v-model="imageHeight"
          label="Image Height (px)"
          type="number"
          min="1"
          class="q-mt-md"
        />
        <!-- Image Alignment Options -->
        <q-select
          v-model="imageAlignment"
          :options="['left', 'center', 'right']"
          label="Image Alignment"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn
          flat
          label="Insert"
          color="primary"
          @click="insertImage"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    updateText: {
      type: Function
    },
    updateSubtitle: {
      type: Function
    },
    index: {
      type: Number
    },
    updateBPMN: {
      type: Function
    }
  },
  setup(props) {
    const $q = useQuasar()
    const dialog = ref(false)
    const label = ref(props.item.subtitle)
    const qeditor = ref(props.item.text)
    const model = ref(null)
    const tableDialog = ref(false)
    const rows = ref(3)
    const cols = ref(3)
    const includeHeader = ref(false)
    const includeFooter = ref(false)
    const colorPickerDialog = ref(false)
    const selectedColor = ref('#000000')
    const imageDialog = ref(false)
    const imageUrl = ref('')
    const imageFile = ref(null)
    const imageWidth = ref('')
    const imageHeight = ref('')
    const imageAlignment = ref('left')
    const isFullscreen = ref(false)
    const editorContainer = ref(null)

    watch(qeditor, (newValue) => {
      props.updateText(props.index, newValue)
    })

    watch(label, (newValue) => {
      props.updateSubtitle(props.index, newValue)
    })

    const readBlobContent = (file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target.result
        props.updateBPMN(props.index, content)
      }
      reader.readAsText(file)
    }

    watch(model, (newValue) => {
      if (newValue) {
        readBlobContent(newValue)
      }
    })

    const open = (pos) => {
      dialog.value = true
    }

    const openTableDialog = () => {
      tableDialog.value = true
    }

    const createTable = () => {
      if (rows.value < 1 || cols.value < 1) {
        $q.notify({
          color: 'negative',
          message: 'Please enter positive numbers for rows and columns.'
        })
        return
      }

      let tableHTML = '<table style="width:100%; border-collapse: collapse;">'

      if (includeHeader.value) {
        tableHTML += '<thead><tr>'
        for (let j = 0; j < cols.value; j++) {
          tableHTML += '<th style="border: 1px solid black; padding: 8px; font-weight: bold;">Header</th>'
        }
        tableHTML += '</tr></thead>'
      }

      tableHTML += '<tbody>'
      for (let i = 0; i < rows.value; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols.value; j++) {
          tableHTML += '<td style="border: 1px solid black; padding: 8px;">Cell</td>'
        }
        tableHTML += '</tr>'
      }
      tableHTML += '</tbody>'

      if (includeFooter.value) {
        tableHTML += '<tfoot><tr>'
        for (let j = 0; j < cols.value; j++) {
          tableHTML += '<td style="border: 1px solid black; padding: 8px; font-style: italic;">Footer</td>'
        }
        tableHTML += '</tr></tfoot>'
      }

      tableHTML += '</table><p></p>'

      qeditor.value += tableHTML
      tableDialog.value = false

      $q.notify({
        color: 'positive',
        message: 'Table inserted successfully',
        icon: 'add'
      })
    }

    const deleteTable = () => {
      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)
      let node = range.startContainer

      // Traverse up the DOM tree to find the table
      while (node && node.nodeName !== 'TABLE') {
        node = node.parentNode
      }

      if (node && node.nodeName === 'TABLE') {
        // Found a table, remove it
        node.parentNode.removeChild(node)

        // Update the editor content
        qeditor.value = document.querySelector('.q-editor__content').innerHTML

        $q.notify({
          color: 'positive',
          message: 'Table deleted successfully',
          icon: 'delete'
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'No table selected. Please place the cursor inside a table before deleting.',
          icon: 'error'
        })
      }
    }

    const openColorPicker = () => {
      colorPickerDialog.value = true
    }

    const applyTextColor = () => {
      document.execCommand('foreColor', false, selectedColor.value)
      $q.notify({
        color: 'positive',
        message: 'Text color changed successfully',
        icon: 'format_color_text'
      })
    }

    const openImageDialog = () => {
      imageDialog.value = true
      imageUrl.value = ''
      imageFile.value = null
      imageWidth.value = ''
      imageHeight.value = ''
      imageAlignment.value = 'left'
    }

    const insertImage = () => {
      let style = 'max-width: 100%;'

      if (imageWidth.value) {
        style += `width: ${imageWidth.value}px;`
      }
      if (imageHeight.value) {
        style += `height: ${imageHeight.value}px;`
      }

      // Add alignment style
      if (imageAlignment.value === 'center') {
        style += 'display: block; margin-left: auto; margin-right: auto;'
      } else {
        style += `float: ${imageAlignment.value};`
      }

      if (imageFile.value) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = `<img src="${e.target.result}" alt="Uploaded image" style="${style}">`
          const wrapper = `<div style="overflow: auto;">${img}</div>`
          qeditor.value += wrapper
          $q.notify({
            color: 'positive',
            message: 'Image uploaded and inserted successfully',
            icon: 'image'
          })
        }
        reader.readAsDataURL(imageFile.value)
      } else if (imageUrl.value) {
        const img = `<img src="${imageUrl.value}" alt="Inserted image" style="${style}">`
        const wrapper = `<div style="overflow: auto;">${img}</div>`
        qeditor.value += wrapper
        $q.notify({
          color: 'positive',
          message: 'Image inserted successfully',
          icon: 'image'
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'Please provide an image URL or upload an image file',
          icon: 'error'
        })
      }
      // Reset image width, height, and alignment
      imageWidth.value = ''
      imageHeight.value = ''
      imageAlignment.value = 'left'
    }

    const deleteImage = () => {
      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)
      let node = range.startContainer

      // Traverse up the DOM tree to find the image or its wrapper
      while (node && node.nodeName !== 'IMG' && node.nodeName !== 'DIV') {
        node = node.parentNode
      }

      if (node) {
        if (node.nodeName === 'IMG') {
          // If the node is an image, remove its parent div (the wrapper)
          node.parentNode.parentNode.removeChild(node.parentNode)
        } else if (node.nodeName === 'DIV' && node.querySelector('img')) {
          // If the node is a div containing an image, remove the div
          node.parentNode.removeChild(node)
        } else {
          $q.notify({
            color: 'negative',
            message: 'No image selected. Please click on an image before deleting.',
            icon: 'error'
          })
          return
        }

        // Update the editor content
        qeditor.value = document.querySelector('.q-editor__content').innerHTML

        $q.notify({
          color: 'positive',
          message: 'Image deleted successfully',
          icon: 'delete_outline'
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'No image selected. Please click on an image before deleting.',
          icon: 'error'
        })
      }
    }

    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value

      if (isFullscreen.value) {
        document.body.style.overflow = 'hidden'
        dialog.value = true

        // Set fullscreen styles with proper overflow
        const editor = document.querySelector('.q-editor')
        if (editor) {
          editor.style.height = '100vh'
          editor.style.maxHeight = '100vh'
          editor.style.display = 'flex'
          editor.style.flexDirection = 'column'

          const toolbar = editor.querySelector('.q-editor__toolbar')
          if (toolbar) {
            toolbar.style.flexShrink = '0'
          }

          const content = editor.querySelector('.q-editor__content')
          if (content) {
            content.style.flex = '1'
            content.style.overflowY = 'auto'
            content.style.height = 'calc(100vh - 130px)' // Account for toolbar and padding
          }
        }
      } else {
        document.body.style.overflow = ''

        // Reset styles
        const editor = document.querySelector('.q-editor')
        if (editor) {
          editor.style.height = ''
          editor.style.maxHeight = ''
          editor.style.display = ''
          editor.style.flexDirection = ''

          const toolbar = editor.querySelector('.q-editor__toolbar')
          if (toolbar) {
            toolbar.style.flexShrink = ''
          }

          const content = editor.querySelector('.q-editor__content')
          if (content) {
            content.style.flex = ''
            content.style.height = ''
            content.style.overflowY = ''
          }
        }
      }
    }

    // Watch for fullscreen changes and handle ESC key
    watch(isFullscreen, (newValue) => {
      if (newValue) {
        const handleEsc = (e) => {
          if (e.key === 'Escape') {
            isFullscreen.value = false
          }
        }
        window.addEventListener('keydown', handleEsc)
        return () => {
          window.removeEventListener('keydown', handleEsc)
        }
      }
    })

    // Watch for content changes
    watch(qeditor, (newValue) => {
      props.updateText(props.index, newValue)
    })

    return {
      label,
      qeditor,
      dialog,
      open,
      model,
      tableDialog,
      rows,
      cols,
      includeHeader,
      includeFooter,
      openTableDialog,
      createTable,
      deleteTable,
      colorPickerDialog,
      selectedColor,
      openColorPicker,
      applyTextColor,
      imageDialog,
      imageUrl,
      imageFile,
      imageWidth,
      imageHeight,
      imageAlignment,
      openImageDialog,
      insertImage,
      deleteImage,

      isFullscreen,
      editorContainer,
      toggleFullscreen
    }
  }
}
</script>
