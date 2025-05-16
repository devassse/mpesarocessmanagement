<template>
  <q-banner inline-actions class="bg-dark text-white">
    You have lost connection to the internet. This app is offline.
    <template v-slot:action>
      <q-btn flat icon="arrow_back" label="" />
    </template>
  </q-banner>
  <div class="pick_file">
    <!-- Loading Overlay -->
    <Transition
      enter-active-class="animate-enter"
      leave-active-class="animate-leave"
    >
      <div
        v-if="loading"
        class="loading-overlay bg-secondary"
      >
        <div>
          <q-spinner-gears
            color="primary"
            size="10rem"
          />
          <div style="height: 2rem;"></div>
          <q-linear-progress
            style="border-radius: 20px;"
            size="20px"
            :value="progress1"
            color="primary"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="transparent"
                text-color="red"
                :label="progressLabel1"
              />
            </div>
          </q-linear-progress>
        </div>
      </div>
    </Transition>
    <!-- File Uploader Component -->
    <FileUploader
      title="Upload Document"
      accepted-formats=".pdf"
      :max-file-size="10485760"
      @file-selected="onFileSelected"
      @file-rejected="onFileRejected"
      @upload-requested="handleUpload"
    />
  </div>
</template>

<script>
import { useSocketStore } from 'stores/socket'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import FileUploader from 'components/ui/FileUploader.vue'
import { pdfService } from 'boot/pdf_service'

export default {
  components: {
    FileUploader
  },
  setup() {
    const loading = ref(false)
    const socketStore = useSocketStore()
    const progress1 = ref(0)
    const $q = useQuasar()
    const selectedFile = ref(null)

    const onFileSelected = (file) => {
      console.log('File selected:', file)
      selectedFile.value = file
    }

    const onFileRejected = (rejectedEntries) => {
      console.error('File rejected:', rejectedEntries)
      $q.notify({
        type: 'negative',
        message: `File rejected: ${rejectedEntries[0]?.failedPropValidation || 'Unknown error'}`
      })
    }

    const handleUpload = async () => {
      if (!selectedFile.value) {
        $q.notify({
          type: 'warning',
          message: 'Please select a file first'
        })
        return
      }

      try {
        // Upload the PDF file using the PDF service
        console.log(selectedFile.value)
        const response = await pdfService.convertPDF(selectedFile.value)

        console.log('Upload response:', response)

        // If upload is successful but we're waiting for processing

      } catch (error) {
        console.error('Upload error:', error)
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to upload file'
        })

      }
    }

    onMounted(() => {
      if (!socketStore.isConnected) {
        socketStore.initSocket()
      }

      socketStore.socket.on("update_progress_bar", (data) => {
        console.log("Conversion status received: ", data)
        progress1.value = data.percentage / 100

        if (data.status === "started") {
          loading.value = true
        } else if (data.status === "completed") {
          setTimeout(() => {
            loading.value = false
            $q.notify({
              type: 'positive',
              message: 'File processing completed'
            })
          }, 2000)
        } else if (data.status === "error") {
          loading.value = false
          $q.notify({
            type: 'negative',
            message: data.message || 'Error processing file'
          })
        }
      })
    })

    onUnmounted(() => {
      socketStore.disconnect()
    })

    return {
      progressLabel1: computed(() => (progress1.value * 100).toFixed(2) + '%'),
      progress1,
      loading,
      onFileSelected,
      onFileRejected,
      handleUpload
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 3rem;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.pick_file {
  position: relative;
  top: 0;
  left: 3rem;
  width: calc(100% - 3rem);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.animate-enter {
  animation: fadeIn 0.3s ease-out;
}

.animate-leave {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
</style>
