<template>
  <div>
    <q-layout view="hHh Lpr lff" container style="height: 100vh">
      <q-header :class="$q.dark.isActive ? 'bg-dark' : 'bg-dark'">
        <q-toolbar>
          <q-btn flat @click="drawerLeft = !drawerLeft" style="rotate: 90deg;" round dense icon="leaderboard" />
          <div class="text-weight-bold q-mr-auto q-ml-md">Content Management Page</div>
          <q-btn flat round dense icon="attachment" @click="showUploadedFiles = true">
            <q-badge v-if="gridFSFileInfos.length > 0" color="red" floating>{{ gridFSFileInfos.length }}</q-badge>
          </q-btn>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="drawerLeft" show-if-above :width="300" :breakpoint="700" :bordered="false"
        class="bg-accent text-white">
        <q-scroll-area class="fit">
          <q-list class="drag-drop-container q-pt-sm"
            style="position: relative; height: calc(100vh - 170px); margin-top: 150px; border-right: solid #dddddd 1px;">
            <q-card-section>
              <div class="text-subtitle2 text-dark">Directory: Root</div>
              <div class="text-secondary" style="display: flex; align-items:center; text-align: center">
                <div>
                  File Name: {{ label }}
                  <q-popup-edit v-model="label" auto-save v-slot="scope">
                    <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                  </q-popup-edit>
                </div>
                <q-icon class="q-ml-xs text-secondary" size="xs" name="draw"></q-icon>
              </div>
            </q-card-section>

            <q-separator />
            <q-btn @click="addItem" align="left" no-caps class="q-ml-sm q-mr-sm q-mb-md q-mt-md" unelevated color="dark"
              style="border-radius: 5px; width: calc(100% - 16px)" unelaveted label="Add Content">
              <q-badge color="secondary" floating transparent>+</q-badge>
            </q-btn>
            <DragDrop :items="fileContentArray" @update:items="handleItemsUpdate" />
          </q-list>
        </q-scroll-area>
        <q-img class="absolute-top" :src="dark" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img :src="images.man" />
            </q-avatar>
            <div class="">{{ user.username }}</div>
            <div>{{ user.email }}</div>
          </div>
        </q-img>
      </q-drawer>

      <q-page-container>
        <q-page class="bg-accent">
          <ContentPage v-if="fileContentArray.length > 0" :updateBPMN="updateBPMN" :items="fileContentArray"
            :updateText="updateText" :updateSubtitle="updateSubtitle" :deleteItem="deleteItem"
            :updateSubject="updateSubject" :subject="subject" :getMultipleFiles="getMultipleFiles"  :createFile="updateFile" />
        </q-page>
      </q-page-container>

      <!-- New popup for uploaded files -->
      <q-dialog v-model="showUploadedFiles">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Uploaded Files</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ gridFSFileInfos.length > 0 ? '' : 'No files uploaded yet.' }}
            <q-list>
              <q-item v-for="file in gridFSFileInfos" :key="file._id">
                <q-item-section>
                  <q-item-label>{{ file.filename.filename }}</q-item-label>
                  <q-item-label caption>{{ formatFileSize(file.length) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn dense round color="negative" icon="delete" @click="deleteFileAttachment(file._id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Close" color="negative" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-layout>
  </div>
</template>

<script>
import { uid } from 'uid';
import DragDrop from '../pages/contentManagment/dragDrop.vue';
import ContentPage from "../pages/contentManagment/contentPage.vue";
import { ref, getCurrentInstance, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getCurrentUser } from 'boot/auth';
import Cookies from 'js-cookie';
import ip from 'src/boot/ips';
import dark from 'src/assets/dark.jpg';
import images from 'src/boot/images';

export default {
  components: {
    DragDrop,
    ContentPage
  },

  async setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();

    const user = ref({
      name: '',
      email: '',
      username: '',
      status: ''
    });

    const authToken = Cookies.get('authToken');

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(authToken);
        user.value = userData;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const fileId = route.params.id;
    const file = await proxy.$directories.getFileById(fileId);

    const label = ref(file.name);
    const drawerLeft = ref(false);
    const fileContentArray = ref(file.content.map(f => ({
      subtitle: f.subtitle,
      label: 'c' + f._id,
      text: f.text,
      BPMN_string: f.BPMN_string
    })));
    const multipleFiles = ref({});
    const subject = ref(file.title || "What's the subject?");
    const gridFSFileInfos = ref(file.gridFSFileInfos || []);
    const showUploadedFiles = ref(false);

    const handleItemsUpdate = (newItems) => {
      fileContentArray.value = newItems;
    };

    const updateText = async (index, value) => {
      let updatedValue = value;
      fileContentArray.value[index].text = updatedValue;
      document.querySelector(`.inner-html-${fileContentArray.value[index].label}`).innerHTML = updatedValue;
    };

    const getBase64ImagesFromText = (text) => {
      const imgRegex = /<img[^>]+src="(data:image\/[^"]+)"[^>]*>/g;
      const matches = [];
      let match;
      while ((match = imgRegex.exec(text)) !== null) {
        matches.push(match[1]);
      }
      return matches;
    };

    const base64ToBlob = (base64) => {
      const parts = base64.split(';base64,');
      const imageType = parts[0].split(':')[1];
      const decodedData = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(decodedData.length);

      for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: imageType });
    };

    const updateSubtitle = (index, value) => {
      fileContentArray.value[index].subtitle = value;
    };

    const updateBPMN = (index, value) => {
      fileContentArray.value[index].BPMN_string = value;
    };

    const updateSubject = (value) => {
      subject.value = value;
    };

    const getMultipleFiles = (value) => {
      multipleFiles.value = value;
    };

    const addItem = () => {
      const newItem = {
        "subtitle": "New Section",
        "text": "<div>Add your content here.</div>",
        label: "str" + uid().toString()
      };
      fileContentArray.value.push(newItem);
      setTimeout(() => {
        document.querySelector(`.inner-html-${fileContentArray.value[fileContentArray.value.length - 1].label}`).innerHTML = newItem.text;
        let element_ = document.querySelector(`.${fileContentArray.value[fileContentArray.value.length - 1].label}`);
        element_.classList.add('appearing');
        setTimeout(() => {
          const selectForAnime = document.querySelectorAll(`.appearing`);
          selectForAnime.forEach(animeItem => animeItem.classList.remove('appearing'));
        }, 500);
      }, 50);
    };

    const deleteItem = (index) => {
      let element_ = document.querySelector(`.${fileContentArray.value[index].label}`);
      element_.classList.add('disappear');
      setTimeout(() => {
        fileContentArray.value.splice(index, 1);
      }, 300);
    };

    const updateFile = async () => {
      for (let index = 0; index < fileContentArray.value.length; index++) {
        let updatedValue = fileContentArray.value[index].text;
        const base64Images = getBase64ImagesFromText(updatedValue);
        const imageBlobs = base64Images.map(base64ToBlob);

        if (imageBlobs.length > 0) {
          try {
            const result = await proxy.$editorCloudF.uploadImages(imageBlobs);
            base64Images.forEach((base64, i) => {
              const fileId = result.fileIds[i];

              const newUrl = `${ip}/directories/uploaded-file/${fileId}`;
              updatedValue = updatedValue.replace(base64, newUrl);
            });
            fileContentArray.value[index].text = updatedValue;
          } catch (error) {
            console.error('Failed to upload images:', error);
            $q.notify({
              type: 'negative',
              message: 'Failed to upload images. Please try again.',
              timeout: 2000,
              position: 'top'
            });
            return;
          }
        }
      }

      try {

        const result = await proxy.$editorCloudF.editFile({
          fileId: fileId,
          name: label.value,
          title: subject.value,
          content: fileContentArray.value,
          files: Object.values(multipleFiles.value)
        });

        console.log('File updated successfully:', result);

        $q.notify({
          type: 'positive',
          message: 'File updated successfully!',
          timeout: 2000,
          position: 'top'
        });
        goBack();
      } catch (error) {
        console.error('Failed to update file:', error);
        $q.notify({
          type: 'negative',
          message: 'File update failed. Please try again.',
          timeout: 2000,
          position: 'top'
        });
      }
    };



    const deleteFileAttachment = async (attachmentId) => {
      try {
        await proxy.$directories.deleteFileAttachments(fileId, [attachmentId]);
        gridFSFileInfos.value = gridFSFileInfos.value.filter(file => file._id !== attachmentId);
        $q.notify({
          type: 'positive',
          message: 'File attachment deleted successfully',
          timeout: 2000,
          position: 'top'
        });
      } catch (error) {
        console.error('Failed to delete file attachment:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to delete file attachment',
          timeout: 2000,
          position: 'top'
        });
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const goBack = () => {
      router.go(-1);
    };

    await fetchUserData();

    return {
      user,
      drawerLeft,
      fileContentArray,
      handleItemsUpdate,
      updateText,
      updateSubtitle,
      updateBPMN,
      addItem,
      deleteItem,
      label,
      subject,
      updateSubject,
      getMultipleFiles,
      updateFile,
      goBack,
      gridFSFileInfos,
      showUploadedFiles,
      deleteFileAttachment,
      formatFileSize,
      dark,
      images
    };
  }
};
</script>
<style>
.draggable {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  color: black;
  background-color: #dddddd;
  border-radius: 8px;
  cursor: move;
  transition: background-color 0.1s ease, opacity 0.3s ease;
}

.draggable.dragging {
  opacity: 0.5;
  border: dotted .5px #222222;
}

.draggable.dropping {
  background-color: #c3e5ae;
}

.appearing {
  animation: appear .4s forwards;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.disappear {
  animation: disappear 0.5s ease-out forwards;
  /* 0.5s duration, ease-out timing, and forwards fill mode */
}

@keyframes disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
