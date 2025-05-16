<template>
  <q-card class="signature-card">
    <q-tabs v-model="tab" class="text-dark" align="justify">
      <q-tab name="draw" icon="create" label="Draw" />
      <q-tab name="type" icon="keyboard" label="Type" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="draw">
        <div class="canvas-container">
          <canvas
            ref="signatureCanvas"
            class="signature-canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="stopDrawing"
          ></canvas>

          <div class="q-mt-md row q-gutter-sm">
            <q-btn-group flat>
              <q-btn color="dark" icon="save" label="Save" @click="saveSignature" />
              <q-btn color="negative" icon="clear" label="Reset" @click="clearCanvas" />
            </q-btn-group>

            <q-btn-group flat>
              <q-btn-dropdown color="grey-8" label="Line Width">
                <q-list>
                  <q-item clickable v-close-popup @click="setLineWidth(1)">
                    <q-item-section>Thin</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setLineWidth(2)">
                    <q-item-section>Medium</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setLineWidth(3)">
                    <q-item-section>Thick</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>

              <q-btn-dropdown color="grey-8" label="Color">
                <q-color v-model="penColor" @input="updatePenColor" />
              </q-btn-dropdown>
            </q-btn-group>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="type">
        <q-input v-model="typedSignature" label="Type your signature" filled />
        <q-select
          v-model="selectedFont"
          :options="fontOptions"
          label="Font Style"
          filled
          class="q-mt-md"
        />
        <div
          class="signature-preview q-mt-md q-pa-md"
          :style="{
            fontFamily: selectedFont.value,
            color: typedColor
          }"
        >
          {{ typedSignature || 'Your signature will appear here' }}
        </div>
        <div class="q-mt-md row q-gutter-sm">
          <q-btn color="dark" icon="save" label="Save" @click="saveTypedSignature" />
          <q-btn-dropdown color="grey-8" label="Text Color">
            <q-color v-model="typedColor" />
          </q-btn-dropdown>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

  <q-dialog v-model="previewDialog">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">Signature Preview</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex justify-center">
        <img :src="signatureData" v-if="tab === 'draw'" class="signature-preview-img"/>
        <div
          v-else
          :style="{
            fontFamily: selectedFont.value,
            color: typedColor
          }"
          class="text-h5"
        >
          {{ typedSignature }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="dark" v-close-popup />
        <q-btn flat label="Confirm" color="dark" @click="confirmSignature" :loading="saving" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { pdfService } from 'boot/pdf_service'

export default {
  name: 'SignaturePage',

  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()

    // Canvas and drawing refs
    const signatureCanvas = ref(null)
    const ctx = ref(null)
    const isDrawing = ref(false)
    const lastX = ref(0)
    const lastY = ref(0)
    const lineWidth = ref(2)

    // UI state refs
    const tab = ref('draw')
    const previewDialog = ref(false)
    const saving = ref(false)

    // Signature style refs
    const penColor = ref('#000000')
    const typedColor = ref('#000000')
    const typedSignature = ref('')
    const signatureData = ref('')

    // Font options
    const selectedFont = ref({ label: 'Dancing Script', value: 'Dancing Script' })
    const fontOptions = [
      { label: 'Dancing Script', value: 'Dancing Script' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Times New Roman', value: 'Times New Roman' },
      { label: 'Cursive', value: 'cursive' }
    ]

    onMounted(() => {
      initCanvas()
      window.addEventListener('resize', initCanvas)
    })

    // Canvas initialization and setup
    const initCanvas = () => {
      const canvas = signatureCanvas.value
      if (!canvas) return

      const rect = canvas.parentElement.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = 200 * dpr

      ctx.value = canvas.getContext('2d')
      ctx.value.scale(dpr, dpr)
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
      ctx.value.strokeStyle = penColor.value
      ctx.value.lineWidth = lineWidth.value
    }

    // Drawing functions
    const startDrawing = (e) => {
      isDrawing.value = true
      const { offsetX, offsetY } = getCoordinates(e)
      lastX.value = offsetX
      lastY.value = offsetY
    }

    const draw = (e) => {
      if (!isDrawing.value) return

      const { offsetX, offsetY } = getCoordinates(e)
      ctx.value.beginPath()
      ctx.value.moveTo(lastX.value, lastY.value)
      ctx.value.lineTo(offsetX, offsetY)
      ctx.value.stroke()

      lastX.value = offsetX
      lastY.value = offsetY
    }

    const stopDrawing = () => {
      isDrawing.value = false
    }

    // Touch event handlers
    const getCoordinates = (e) => {
      if (e.type.includes('touch')) {
        const rect = e.target.getBoundingClientRect()
        const touch = e.touches[0]
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top
        }
      }
      return {
        offsetX: e.offsetX,
        offsetY: e.offsetY
      }
    }

    const handleTouchStart = (e) => {
      e.preventDefault()
      startDrawing(e)
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      draw(e)
    }

    // Canvas utilities
    const clearCanvas = () => {
      const canvas = signatureCanvas.value
      ctx.value.clearRect(0, 0, canvas.width, canvas.height)
      initCanvas()
    }

    const isCanvasBlank = (canvas) => {
      const pixelBuffer = new Uint32Array(
        ctx.value.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      )
      return !pixelBuffer.some(color => color !== 0)
    }

    const getSignatureBounds = (canvas) => {
      const context = canvas.getContext('2d')
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let left = canvas.width
      let right = 0
      let top = canvas.height
      let bottom = 0

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4
          const alpha = data[idx + 3]
          if (alpha > 0) {
            left = Math.min(left, x)
            right = Math.max(right, x)
            top = Math.min(top, y)
            bottom = Math.max(bottom, y)
          }
        }
      }

      if (left > right || top > bottom) {
        return null
      }

      const padding = 10
      left = Math.max(0, left - padding)
      right = Math.min(canvas.width, right + padding)
      top = Math.max(0, top - padding)
      bottom = Math.min(canvas.height, bottom + padding)

      return {
        left,
        top,
        width: right - left,
        height: bottom - top
      }
    }

    // Signature saving functions
    const saveSignature = () => {
      const canvas = signatureCanvas.value
      if (isCanvasBlank(canvas)) {
        $q.notify({
          color: 'negative',
          message: 'Please draw your signature first'
        })
        return
      }

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      const bounds = getSignatureBounds(canvas)

      if (bounds) {
        tempCanvas.width = bounds.width
        tempCanvas.height = bounds.height

        tempCtx.drawImage(
          canvas,
          bounds.left, bounds.top, bounds.width, bounds.height,
          0, 0, bounds.width, bounds.height
        )

        signatureData.value = tempCanvas.toDataURL('image/png')
      } else {
        signatureData.value = canvas.toDataURL('image/png')
      }

      previewDialog.value = true
    }

    const saveTypedSignature = () => {
      if (!typedSignature.value) {
        $q.notify({
          color: 'negative',
          message: 'Please type your signature first'
        })
        return
      }
      previewDialog.value = true
    }

    // Style update functions
    const setLineWidth = (width) => {
      lineWidth.value = width
      ctx.value.lineWidth = width
    }

    const updatePenColor = (color) => {
      ctx.value.strokeStyle = color
    }

    // Signature processing utilities
    const dataURLtoBlob = (dataURL) => {
      const arr = dataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      return new Blob([u8arr], { type: mime })
    }

    const createTypedSignatureImage = async () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 600
      canvas.height = 200

      ctx.font = `48px ${selectedFont.value.value}`
      ctx.fillStyle = typedColor.value
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.fillText(typedSignature.value, canvas.width / 2, canvas.height / 2)

      return canvas.toDataURL('image/png')
    }

    // Final signature confirmation and upload
    const confirmSignature = async () => {
      try {
        saving.value = true
        const pdfId = route.params.id
        console.log(pdfId)

        let signatureBlob
        if (tab.value === 'draw') {
          signatureBlob = dataURLtoBlob(signatureData.value)
        } else {
          const typedSignatureDataURL = await createTypedSignatureImage()
          signatureBlob = dataURLtoBlob(typedSignatureDataURL)
        }

        const signatureFile = new File([signatureBlob], 'signature.png', {
          type: 'image/png'
        })

        await pdfService.updateSignature(pdfId, signatureFile)

        $q.notify({
          color: 'positive',
          message: 'Signature saved successfully'
        })

        router.push(`/edit_document/${pdfId}`)

      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.message || 'Failed to save signature'
        })
      } finally {
        saving.value = false
        previewDialog.value = false
      }
    }

    return {
      signatureCanvas,
      tab,
      typedSignature,
      signatureData,
      previewDialog,
      selectedFont,
      fontOptions,
      penColor,
      typedColor,
      saving,
      startDrawing,
      draw,
      stopDrawing,
      clearCanvas,
      saveSignature,
      saveTypedSignature,
      confirmSignature,
      setLineWidth,
      updatePenColor,
      handleTouchStart,
      handleTouchMove
    }
  }
}
</script>

<style scoped>
.signature-card {
max-width: 800px;
margin: 0 auto;
}

.canvas-container {
width: 100%;
border: 1px solid #ddd;
border-radius: 4px;
}

.signature-canvas {
width: 100%;
height: 200px;
touch-action: none;
}

.signature-preview {
min-height: 100px;
border: 1px solid #ddd;
border-radius: 4px;
display: flex;
align-items: center;
justify-content: center;
font-size: 24px;
background: white;
}

.signature-preview-img {
max-width: 100%;
max-height: 200px;
display: block;
margin: 0 auto;
}
</style>
