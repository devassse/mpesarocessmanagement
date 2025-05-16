<template>

    <q-layout view="hHh Lpr lff" container style="height: 100vh">
      <q-header :class="$q.dark.isActive ? 'bg-dark' : 'bg-dark'">
        <q-toolbar>
          <q-btn flat @click="drawerLeft = !drawerLeft" style="rotate: 90deg;" round dense icon="leaderboard" />
          <div class="text-weight-bold q-mr-auto q-ml-md">Content Management Page</div>
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
          <ContentPage :updateBPMN="updateBPMN" :items="fileContentArray" :updateText="updateText"
            :updateSubtitle="updateSubtitle" :deleteItem="deleteItem" :updateSubject="updateSubject" :subject="subject"
            :getMultipleFiles="getMultipleFiles" :createFile="createFile" />
        </q-page>
      </q-page-container>

      <q-page-sticky v-if="$route.params.dir" position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="person_add" color="dark" @click="openApproversDialog" />
      </q-page-sticky>
       <!-- Approvers Dialog -->
       <q-dialog v-model="approversDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Select Approvers</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select
              v-model="selectedApprovers"
              :options="approverOptions"
              option-value="_id"
              option-label="name"
              multiple
              emit-value
              map-options
              use-chips
              label="Approvers"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No approvers found
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="negative" v-close-popup />
            <q-btn flat label="Select" color="primary" @click="selectApprovers" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-layout>
</template>

<script>
import { uid } from 'uid';
import DragDrop from '../pages/contentManagment/dragDrop.vue';
import ContentPage from "../pages/contentManagment/contentPage.vue";
import { ref, getCurrentInstance, onMounted } from 'vue';
import { createFile } from 'src/boot/directories';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import Notify from Quasar
import { getCurrentUser } from 'boot/auth'; // Import the getCurrentUser function
import Cookies from 'js-cookie';
import { getApprovers } from 'src/boot/roles'; // Import the getApprovers function
import ip from 'src/boot/ips';
import dark from 'src/assets/dark.jpg';
import images from 'src/boot/images';



export default {
  components: {
    DragDrop,
    ContentPage
  },
  setup() {
    const { proxy } = getCurrentInstance(); // Get the current instance proxy
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar(); // Use useQuasar to access $q.notify

    const user = ref({
      name: '',
      email: '',
      username: '',
      status: ''
    });


    const approversDialog = ref(false);
    const approverOptions = ref([]);
    const selectedApprovers = ref([]);



    const authToken = Cookies.get('authToken'); // Get auth token from cookies


    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(authToken);
        user.value = userData;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    onMounted(fetchUserData);



    const goBack = () => {
      router.go(-1)
    }
    const label = ref("New File")
    const drawerLeft = ref(false);
    const fileContentArray = ref([
      {
        "subtitle": "Process Design and Development",
        "text": "Based on the gathered requirements, the process design phase involves creating detailed workflows and process maps. Various tools and methodologies, such as BPMN (Business Process Model and Notation), are used to visually represent the process flow. Design reviews and validation sessions are conducted to ensure the process meets all requirements and adheres to best practices. Any necessary adjustments are made based on feedback.",
        "label": "str" + uid()
      },
      {
        "subtitle": "Implementation and Integration",
        "text": "In this final phase, the designed process is implemented within the organization. This involves configuring necessary tools and technologies, training staff, and integrating the new process with existing systems. Pilot tests are conducted to identify any issues or inefficiencies, and adjustments are made accordingly. Once the process is fully operational, continuous monitoring and optimization are carried out to ensure it remains effective and efficient.",
        "label": "str" + uid()
      },
      {
        "subtitle": "Implementation and Integration",
        "text": "In this final phase, the designed process is implemented within the organization. This involves configuring necessary tools and technologies, training staff, and integrating the new process with existing systems. Pilot tests are conducted to identify any issues or inefficiencies, and adjustments are made accordingly. Once the process is fully operational, continuous monitoring and optimization are carried out to ensure it remains effective and efficient.",
        "label": "str" + uid()
      },
      {
        "subtitle": "Implementation and Integration",
        "text": "In this final phase, the designed process is implemented within the organization. This involves configuring necessary tools and technologies, training staff, and integrating the new process with existing systems. Pilot tests are conducted to identify any issues or inefficiencies, and adjustments are made accordingly. Once the process is fully operational, continuous monitoring and optimization are carried out to ensure it remains effective and efficient.",
        "label": "str" + uid()
      }
    ]);
    const multipleFiles = ref({})
    const subject = ref("Whats the subject?")

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
        "subtitle": "Requirement Gathering and Analysis",
        "text": "<div>In this critical phase, detailed business requirements are collected through various means such as interviews, surveys, and workshops. Stakeholders from different departments provide input to ensure comprehensive coverage of needs. These requirements are then documented and analyzed to identify key features and functionalities needed in the process. Any potential risks or challenges are also identified at this stage.</div>",
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

    const createFile = async () => {
      // Process each item in fileContentArray
      for (let index = 0; index < fileContentArray.value.length; index++) {
        let updatedValue = fileContentArray.value[index].text;

        // Get list of all base64 images in the text
        const base64Images = getBase64ImagesFromText(updatedValue);
        console.log('Base64 images found:', base64Images);

        // Convert base64 images to Blobs
        const imageBlobs = base64Images.map(base64ToBlob);
        console.log('Image Blobs created:', imageBlobs.length);

        // Upload the image blobs
        if (imageBlobs.length > 0) {
          try {
            const result = await proxy.$editorCloudF.uploadImages(imageBlobs);
            console.log('Uploaded image IDs:', result.fileIds);

            // Replace base64 images with uploaded image IDs
            base64Images.forEach((base64, i) => {
              const fileId = result.fileIds[i];

              const newUrl = `${ip}/directories/uploaded-file/${fileId}`;
              updatedValue = updatedValue.replace(base64, newUrl);
            });

            // Update the content with the new image URLs
            fileContentArray.value[index].text = updatedValue;

          } catch (error) {
            console.error('Failed to upload images:', error);
            $q.notify({
              type: 'negative',
              message: 'Failed to upload images. Please try again.',
              timeout: 2000,
              position: 'top'
            });
            return; // Exit the function if image upload fails
          }
        }
      }

      // Now proceed with file creation
      try {
        if (route.params.dir) {
          await proxy.$editorCloudF.uploadFiles({
            files: multipleFiles.value,
            title: subject.value,
            content: fileContentArray.value,
            parent: route.params.dir,
            name: label.value,
            approvalRequests: selectedApprovers.value.map(email => ({ email: email, status: 'pending' }))

          });
        } else {
          await proxy.$editorCloudF.uploadFiles({
            files: multipleFiles.value,
            title: subject.value,
            content: fileContentArray.value,
            parent: "",
            name: label.value,

          });
        }

        $q.notify({
          type: 'positive',
          message: 'File uploaded successfully!',
          timeout: 2000,
          position: 'top'
        });
        goBack();
      } catch (error) {
        console.error('Failed to upload file:', error);
        $q.notify({
          type: 'negative',
          message: 'File upload failed. Please try again.',
          timeout: 2000,
          position: 'top'
        });
      }
    };


    // Approvers Dialog is only if file in not being create at root


    const openApproversDialog = async () => {
      try {
        const dirId = route.params.dir; // Replace this with actual file ID when available
        const approvers = await getApprovers(dirId);
        console.log(approvers)
        approverOptions.value = approvers.map( d => d.email);
        approversDialog.value = true;
      } catch (error) {
        console.error('Failed to fetch approvers:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to fetch approvers. Please try again.',
          timeout: 2000,
          position: 'top'
        });
      }
    };

    const selectApprovers = () => {
      console.log('Selected approvers:', selectedApprovers.value);
      // Here you can add logic to handle the selected approvers
      // For example, you might want to store them in a ref to use when creating the file
    };



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
      createFile,
      goBack,
      approversDialog,
      approverOptions,
      selectedApprovers,
      openApproversDialog,
      selectApprovers,
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
