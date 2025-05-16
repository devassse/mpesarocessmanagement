<template>
  <q-card class="q-pa-xs text-center" style="position:fixed; left: 0; top: 0; box-shadow: 2px 10px 5px #22222250; width: 10rem; display: none">
    <q-list bordered separator>
      <q-item clickable v-ripple @click="deleteFile">
        <q-item-section>Delete</q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section>Open</q-item-section>
      </q-item>
      <q-item v-if="isEditable" clickable v-ripple @click="editFile">
        <q-item-section>Edit</q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section>Rename</q-item-section>
      </q-item>
      <q-item clickable v-ripple :to="url_">
        <q-item-section>Create new Version</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="showVersions">
        <q-item-section>View All Versions</q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="versionsDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">File Versions</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list dense>
            <q-item v-for="version in fileVersions" :key="version.file._id">
              <q-item-section side>
                <q-icon
                  :name="version.file.isActiveVersion ? 'circle' : 'radio_button_unchecked'"
                  :color="version.file.isActiveVersion ? 'green' : 'grey'"
                  size="xs"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Version {{ version.file.version }}</q-item-label>
                <q-item-label caption>
                  Created: {{ new Date(version.file.createdAt).toLocaleString() }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="primary" icon="open_in_new" @click="openVersion(version.file._id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>
<script>
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { getAllFileVersions } from 'boot/directories'; // Adjust the import path as needed

export default {
  props: {
    deleteFile: Function,
    editFile: Function,
    file: Object
  },
  setup(props) {
    const $q = useQuasar();
    const isEditable = ref(false);
    const url_ = ref('');
    const versionsDialog = ref(false);
    const fileVersions = ref([]);

    const updateEditableStatus = () => {
      if (props.file.obj && props.file.obj[0]) {
        isEditable.value = props.file.obj[0].approvalStatus !== "approved";
        url_.value = '/create-new-version/' + props.file.obj[0]._id;
      } else {
        isEditable.value = false;
      }
    };

    const showVersions = async () => {
      try {
        const versions = await getAllFileVersions(props.file.obj[0]._id);
        fileVersions.value = versions.versions;
        versionsDialog.value = true;
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Failed to fetch file versions',
          icon: 'report_problem'
        });
      }
    };

    const openVersion = (versionId) => {
      // Implement the logic to open a specific version
      console.log('Opening version:', versionId);
      // You might want to navigate to a new page or open the version in a new tab
    };

    // Watch for changes in the file prop
    watch(() => props.file, (newFile) => {
      if (props.file) {
        updateEditableStatus();
      }
    }, { deep: true, immediate: true });

    return {
      isEditable,
      url_,
      versionsDialog,
      fileVersions,
      showVersions,
      openVersion
    };
  }
}
</script>

<style lang="scss">
/* Add your styles here */
</style>
