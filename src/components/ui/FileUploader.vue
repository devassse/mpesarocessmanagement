// FileUploader.vue
<template>
  <div class="file-uploader">
    <q-card class="file-upload-card" flat >
      <q-card-section>


        <!-- Drag and Drop Zone -->
        <q-file
          v-model="selectedFile"
          :label="label"
          filled
          style="width: 100%"
          @rejected="onRejected"
          :accept="acceptedFormats"
          :max-file-size="maxFileSize"
          @update:model-value="handleFileSelected"
        >
          <template v-slot:default>
            <div
              class="upload-zone q-pa-md"
              :class="{ 'file-dragging': isDragging }"
              @dragenter="isDragging = true"
              @dragleave="isDragging = false"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div class="row items-center justify-center">
                <q-icon
                  :name="selectedFile ? 'check_circle' : 'cloud_upload'"
                  size="4rem"
                  :color="selectedFile ? 'positive' : 'secondary'"
                  class="q-mb-md"
                />
              </div>

              <div class="text-center" style="max-width: 100px;">
                <template v-if="!selectedFile">
                  <div class="text-h6 q-mb-sm">{{ dropzoneText }}</div>
                  <div class="text-caption text-grey">or click to browse</div>
                  <div class="text-caption q-mt-sm">
                    Supported formats: {{ formatsList }}
                  </div>
                </template>
                <template v-else>
                  <div class="text-subtitle1 q-mb-xs q-pa-sm">{{ selectedFile.name }}</div>
                  <div class="text-caption text-grey">
                    {{ formatFileSize(selectedFile.size) }}
                  </div>
                </template>
              </div>
            </div>
          </template>
        </q-file>

        <!-- File Preview Section -->
        <div v-if="selectedFile" class="q-mt-md">
          <q-banner class="bg-secondary text-white">
            <template v-slot:avatar>
              <q-icon name="description" />
            </template>
            <div class="row items-center justify-between full-width">
              <div>
                <div class="text-subtitle1">{{ selectedFile.name }}</div>
                <div class="text-caption">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
              <div>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="white"
                  @click="clearFile"
                />
              </div>
            </div>
          </q-banner>
        </div>

        <!-- Action Buttons -->
        <div v-if="showActions" class="row justify-left q-mt-lg q-gutter-md">
          <q-btn
            color="secondary"
            icon="upload_file"
            :label="uploadButtonText"
            :disable="!selectedFile"
            @click="handleUpload"
            flat
          />
          <q-btn
            flat
            color="negative"
            icon="clear"
            :label="clearButtonText"
            :disable="!selectedFile"
            @click="clearFile"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Error Notification -->
    <q-dialog v-model="showError">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="error" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ errorMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'FileUploader',

  props: {
    // Main settings
    title: {
      type: String,
      default: 'Upload Your File'
    },
    label: {
      type: String,
      default: 'Choose a file or drag it here'
    },
    dropzoneText: {
      type: String,
      default: 'Drop your file here'
    },
    // File restrictions
    acceptedFormats: {
      type: String,
      default: '.pdf,.doc,.docx,.txt'
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    // Button customization
    showActions: {
      type: Boolean,
      default: true
    },
    uploadButtonText: {
      type: String,
      default: 'Upload'
    },
    clearButtonText: {
      type: String,
      default: 'Clear'
    }
  },

  emits: [
    'file-selected',
    'file-rejected',
    'file-cleared',
    'upload-requested',
    'error'
  ],

  data() {
    return {
      selectedFile: null,
      isDragging: false,
      showError: false,
      errorMessage: ''
    }
  },

  computed: {
    formatsList() {
      return this.acceptedFormats
        .split(',')
        .map(format => format.toUpperCase().replace('.', ''))
        .join(', ');
    }
  },

  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    handleDrop(e) {
      this.isDragging = false;
      if (e.dataTransfer.files.length) {
        this.selectedFile = e.dataTransfer.files[0];
        this.$emit('file-selected', this.selectedFile);
      }
    },

    onRejected(rejectedEntries) {
      this.errorMessage = rejectedEntries[0].failedPropValidation === 'max-file-size'
        ? `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`
        : 'Invalid file format';
      this.showError = true;
      this.$emit('file-rejected', rejectedEntries);
      this.$emit('error', this.errorMessage);
    },

    clearFile() {
      this.selectedFile = null;
      this.$emit('file-cleared');
    },

    handleFileSelected(file) {
      this.$emit('file-selected', file);
    },

    handleUpload() {
      this.$emit('upload-requested', this.selectedFile);
    }
  }
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.file-upload-card {
  width: 100%;
  max-width: 500px;
  background: white;
}

.upload-zone {
  border: 2px dashed var(--q-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(var(--q-accent), 0.05);
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 1rem;
}

.upload-zone:hover {
  border-color: var(--q-grey-1);
  background: rgba(var(--q-grey-1), 0.1);
}

.file-dragging {
  border-color: var(--q-positive);
  background: rgba(var(--q-positive), 0.1);
  transform: scale(1.02);
}
</style>
