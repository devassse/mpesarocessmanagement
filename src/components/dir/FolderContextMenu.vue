<template>
  <q-card class="q-pa-xs text-center" style="position:fixed; left: 0; top: 0; box-shadow: 2px 10px 5px #22222250; width: 10rem; display: none">
    <q-list bordered separator>
      <q-item clickable v-ripple @click="deleteFolder(folderId)">
        <q-item-section>Delete</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="openFolder(folderId)">
        <q-item-section>Open</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="renameFolder(folderId)">
        <q-item-section>Rename</q-item-section>
      </q-item>
      <q-item v-if="canAddDirToGroup" clickable v-ripple @click="openAddToGroupDialog">
        <q-item-section>Add to Group</q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="showAddToGroupDialog">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Add to Group</div>
        </q-card-section>
        <q-card-section>
          <q-tree
            :nodes="groupTreeNodes"
            node-key="id"
            label-key="label"
            selected-color="primary"
            v-model:selected="selectedGroup"
            :loading="isLoading"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Add" color="primary" @click="handleAddToGroup" :loading="isAddingToGroup" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { addDirToGroupFromDirectory, getAllGroupsAndChildrenInDirectory } from 'src/boot/roles';

export default {
  props: {
    deleteFolder: Function,
    openFolder: Function,
    renameFolder: Function,
    permissions: Array,
    folderId: String,
    directoryId: String
  },
  setup(props) {
    const $q = useQuasar();
    const route = useRoute();
    const showAddToGroupDialog = ref(false);
    const selectedGroup = ref(null);
    const groupTreeNodes = ref([]);
    const isLoading = ref(false);
    const isAddingToGroup = ref(false);

    const canAddDirToGroup = computed(() => {
      return props.permissions && props.permissions.includes('invite_member');
    });

    const formatGroupsToTreeNodes = (groups) => {
      const seenGroups = new Set();
      const formatGroup = (group) => {
        if (seenGroups.has(group.groupId)) {
          return null;
        }
        seenGroups.add(group.groupId);
        return {
          id: group.groupId,
          label: group.name,
          children: group.children
            .map(formatGroup)
            .filter(child => child !== null)
        };
      };
      return groups.map(formatGroup).filter(group => group !== null);
    };

    const fetchGroupsAndChildren = async () => {
      if (!canAddDirToGroup.value) return;

      const directoryId = props.directoryId;
      isLoading.value = true;
      try {
        const groups = await getAllGroupsAndChildrenInDirectory(directoryId);
        groupTreeNodes.value = formatGroupsToTreeNodes(groups);
      } catch (error) {
        console.error('Error fetching groups and children:', error);
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to fetch groups: ' + error.message
        });
      } finally {
        isLoading.value = false;
      }
    };

    const openAddToGroupDialog = () => {
      showAddToGroupDialog.value = true;
      if (groupTreeNodes.value.length === 0) {
        fetchGroupsAndChildren();
      }
    };

    const handleAddToGroup = async () => {
      if (!selectedGroup.value) {
        $q.notify({
          color: 'warning',
          message: 'Please select a group'
        });
        return;
      }

      const directoryId = route.params.dir;
      isAddingToGroup.value = true;
      try {
        await addDirToGroupFromDirectory(directoryId, selectedGroup.value, props.folderId);
        $q.notify({
          color: 'positive',
          message: 'Directory added to group successfully'
        });
        selectedGroup.value = null;
        showAddToGroupDialog.value = false;
      } catch (error) {
        console.error('Error adding directory to group:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to add directory to group: ' + error.message
        });
      } finally {
        isAddingToGroup.value = false;
      }
    };

    watch(() => props.permissions, fetchGroupsAndChildren);

    return {
      canAddDirToGroup,
      showAddToGroupDialog,
      selectedGroup,
      groupTreeNodes,
      handleAddToGroup,
      isLoading,
      isAddingToGroup,
      openAddToGroupDialog
    };
  }
}
</script>

<style lang="scss">
</style>
