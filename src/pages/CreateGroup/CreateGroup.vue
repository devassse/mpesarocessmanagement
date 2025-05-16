<template>
  <div>
    <div class="bg-dark">
      <q-card class="bg-dark q-pt-xl" style="border:0" flat>
        <div class="image-avatar-1 bg-secondary" style="border-radius: 100%;">
          <img :src="images.catalog" class="appearBox"
            style="position: absolute; object-position: fit; height: 60%; width: 60%">
        </div>
        <q-card-section class="text-center q-pt-sm text-white appearBox">
          <div class="text-h6">Group Hierarchy</div>
          <div class="text-caption">Manage and organize your groups efficiently</div>
        </q-card-section>
      </q-card>
    </div>

    <q-splitter v-model="splitterModel" style="height: calc(100vh - 200px)">
      <template v-slot:before>
        <div class="q-pa-md">
          <q-btn color="secondary" unelevated label="Create New Group" @click="openCreateGroupDialog" class="q-mb-md" />
          <q-tree :nodes="groupHierarchy" node-key="name" label-key="name" children-key="children"
            selected-color="primary" v-model:selected="selectedGroup" v-model:expanded="expanded">
            <template v-slot:default-header="prop">
              <div class="row items-center">
                <div>{{ prop.node.name }}</div>
                <q-chip v-if="prop.node.users" size="sm" class="q-ml-sm">
                  {{ prop.node.users.length }} users
                </q-chip>
              </div>
            </template>
          </q-tree>
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels v-model="selectedGroup" animated transition-prev="jump-up" transition-next="jump-up"
          class="q-pa-md">
          <q-tab-panel :name="group.name" v-for="group in flattenedGroups" :key="group.name">
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">{{ group.name }}</div>
              <q-btn
                color="negative"
                flat
                icon="delete"
                label="Delete Group"
                @click="deleteGroupHandler(group._id, group.name)"
                :disabled="group.children && group.children.length > 0"
              >
                <q-tooltip>
                  {{ group.children && group.children.length > 0
                    ? 'Cannot delete group with children'
                    : 'Delete this group' }}
                </q-tooltip>
              </q-btn>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2">Description:</div>
              <p>{{ group.description }}</p>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2">Group Permissions:</div>
              <q-chip v-for="permission in group.userPermissions" :key="permission" color="dark" text-color="white"
                size="sm" class="q-ma-xs">
                {{ permission }}
              </q-chip>
            </div>

            <div class="text-subtitle1 q-mb-sm">Users:</div>
            <q-list bordered separator>
              <q-item v-for="user in group.users" :key="user._id">
                <q-item-section>
                  <q-item-label>{{ user.username }}</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip v-for="permission in user.userPermissions" :key="permission" color="secondary"
                    text-color="white" size="sm">
                    {{ permission }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="text-subtitle1 q-mt-md q-mb-sm">Folders:</div>
            <q-list bordered separator>
              <q-item v-for="folder in group.folders" :key="folder._id">
                <q-item-section avatar>
                  <q-icon name="folder" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ folder.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip v-for="permission in folder.permissions" :key="permission" color="secondary"
                    text-color="white" size="sm">
                    {{ permission }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <q-btn color="dark" unelevated label="Add to Directory" @click="openAddToDirectoryDialog" class="q-mt-md" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>

    <q-dialog v-model="createGroupDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Create New Group</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newGroupName" label="Group Name" dense />
          <q-input v-model="newGroupDescription" label="Description" type="textarea" dense />
          <q-select v-model="newGroupParent" :options="flattenedGroups" option-label="name" option-value="_id"
            label="Parent Group (optional)" dense emit-value map-options
            @update:model-value="updateAvailablePermissions" />
          <q-select v-model="newGroupPermissions" :options="availablePermissions" label="User Permissions" multiple
            dense emit-value map-options />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Create" color="secondary" @click="createGroup" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New dialog for adding group to directory -->
    <q-dialog v-model="addToDirectoryDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Group to Directory</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select v-model="selectedDirectory" :options="unassociatedDirectories" option-label="name"
            option-value="_id" label="Select Directory" dense emit-value map-options />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Add" color="secondary" @click="addGroupToDirectoryHandler" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getAllGroups, createGroup as createGroupApi, addGroupToDirectory } from 'boot/roles'
import { getDirectoriesByGroup, getUnassociatedRootDirectories, deleteGroup } from 'boot/directories'
import images from 'src/boot/images';


export default {
  setup() {
    const $q = useQuasar()
    const groupHierarchy = ref([])
    const expanded = ref([])
    const createGroupDialog = ref(false)
    const splitterModel = ref(50)
    const selectedGroup = ref(null)

    const newGroupName = ref('')
    const newGroupDescription = ref('')
    const newGroupParent = ref(null)
    const newGroupPermissions = ref([])
    const availablePermissions = ref(['read', 'write', 'invite_member', "checker"])

    // New refs for Add to Directory feature
    const addToDirectoryDialog = ref(false)
    const unassociatedDirectories = ref([])
    const selectedDirectory = ref(null)

    const fetchGroups = async () => {
      try {
        const groups = await getAllGroups()
        groupHierarchy.value = groups.filter(group => !group.parent)
        expanded.value = groupHierarchy.value.map(group => group.name)
        if (groupHierarchy.value.length > 0) {
          selectedGroup.value = groupHierarchy.value[0].name
        }
        // Fetch folders for all groups
        await Promise.all(flattenedGroups.value.map(fetchFoldersForGroup))
      } catch (error) {
        console.error('Error fetching groups:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to load groups. Please try again.',
          icon: 'error'
        })
      }
    }

    const fetchFoldersForGroup = async (group) => {
      try {
        const folders = await getDirectoriesByGroup(group._id)
        group.folders = folders
      } catch (error) {
        console.error(`Error fetching folders for group ${group.name}:`, error)
        group.folders = []
      }
    }

    const flattenedGroups = computed(() => {
      const flatten = (groups, parentName = null) => {
        return groups.reduce((acc, group) => {
          acc.push({
            name: group.name,
            _id: group._id,
            parentName,
            users: group.users,
            userPermissions: group.userPermissions,
            description: group.description,
            folders: []  // Initialize folders array
          })
          if (group.children && group.children.length > 0) {
            acc.push(...flatten(group.children, group.name))
          }
          return acc
        }, [])
      }
      return flatten(groupHierarchy.value)
    })

    const openCreateGroupDialog = () => {
      newGroupName.value = ''
      newGroupDescription.value = ''
      newGroupParent.value = null
      newGroupPermissions.value = []
      createGroupDialog.value = true
    }

    const updateAvailablePermissions = (parentId) => {
      if (parentId) {
        const parentGroup = flattenedGroups.value.find(group => group._id === parentId)
        if (parentGroup) {
          availablePermissions.value = parentGroup.userPermissions || ['read', 'write', 'invite_member', "checker"]
          newGroupPermissions.value = newGroupPermissions.value.filter(perm =>
            availablePermissions.value.includes(perm)
          )
        }
      } else {
        availablePermissions.value = ['read', 'write', 'invite_member', "checker"] // Reset to default permissions
      }
    }

    const createGroup = async () => {
      if (!newGroupName.value) {
        $q.notify({
          color: 'negative',
          message: 'Group name is required',
          icon: 'error'
        })
        return
      }

      try {
        await createGroupApi({
          name: newGroupName.value,
          description: newGroupDescription.value,
          userPermissions: newGroupPermissions.value,
          parentId: newGroupParent.value
        })
        await fetchGroups()
        $q.notify({
          color: 'positive',
          message: 'Group created successfully',
          icon: 'check_circle'
        })
        // Reset form fields
        newGroupName.value = ''
        newGroupDescription.value = ''
        newGroupParent.value = null
        newGroupPermissions.value = []
        createGroupDialog.value = false
      } catch (error) {
        console.error('Error creating group:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to create group. Please try again.',
          icon: 'error'
        })
      }
    }

    // New methods for Add to Directory feature
    const openAddToDirectoryDialog = async () => {
      const selectedGroupObj = flattenedGroups.value.find(group => group.name === selectedGroup.value)
      if (selectedGroupObj) {
        try {
          unassociatedDirectories.value = await getUnassociatedRootDirectories(selectedGroupObj._id)
          addToDirectoryDialog.value = true
        } catch (error) {
          console.error('Error fetching unassociated directories:', error)
          $q.notify({
            color: 'negative',
            message: 'Failed to load available directories. Please try again.',
            icon: 'error'
          })
        }
      }
    }

    const addGroupToDirectoryHandler = async () => {
      if (!selectedDirectory.value) {
        $q.notify({
          color: 'negative',
          message: 'Please select a directory',
          icon: 'error'
        })
        return
      }

      const selectedGroupObj = flattenedGroups.value.find(group => group.name === selectedGroup.value)
      if (selectedGroupObj) {
        try {
          await addGroupToDirectory(selectedGroupObj._id, selectedDirectory.value)
          await fetchFoldersForGroup(selectedGroupObj)
          $q.notify({
            color: 'positive',
            message: 'Group added to directory successfully',
            icon: 'check_circle'
          })
          selectedDirectory.value = null
          addToDirectoryDialog.value = false
        } catch (error) {
          console.error('Error adding group to directory:', error)
          $q.notify({
            color: 'negative',
            message: 'Failed to add group to directory. Please try again.',
            icon: 'error'
          })
        }
      }
    }

    // Watch for changes in the selected group and fetch folders if needed
    watch(selectedGroup, async (newValue) => {
      const selectedGroupObj = flattenedGroups.value.find(group => group.name === newValue)
      if (selectedGroupObj && !selectedGroupObj.folders.length) {
        await fetchFoldersForGroup(selectedGroupObj)
      }
    })

    onMounted(fetchGroups)

    const deleteGroupHandler = async (groupId, groupName) => {
      try {
        // Show confirmation dialog
        $q.dialog({
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`,
          ok: {
            color: 'negative',
            label: 'Delete'
          },
          cancel: {
            flat: true,
            label: 'Cancel'
          },
          persistent: true
        }).onOk(async () => {
          try {
            await deleteGroup(groupId)
            await fetchGroups() // Refresh the group list

            // If the deleted group was selected, select the first available group
            if (selectedGroup.value === groupName) {
              selectedGroup.value = groupHierarchy.value.length > 0
                ? groupHierarchy.value[0].name
                : null
            }

            $q.notify({
              color: 'positive',
              message: 'Group deleted successfully',
              icon: 'check_circle'
            })
          } catch (error) {
            console.error('Error deleting group:', error)
            $q.notify({
              color: 'negative',
              message: error.response?.data?.error || 'Failed to delete group. Please try again.',
              icon: 'error'
            })
          }
        })
      } catch (error) {
        console.error('Error in delete handler:', error)
        $q.notify({
          color: 'negative',
          message: 'An unexpected error occurred',
          icon: 'error'
        })
      }
    }

    return {
      groupHierarchy,
      expanded,
      createGroupDialog,
      splitterModel,
      selectedGroup,
      newGroupName,
      newGroupDescription,
      newGroupParent,
      newGroupPermissions,
      availablePermissions,
      flattenedGroups,
      openCreateGroupDialog,
      updateAvailablePermissions,
      createGroup,
      // New returns for Add to Directory feature
      addToDirectoryDialog,
      unassociatedDirectories,
      selectedDirectory,
      openAddToDirectoryDialog,
      addGroupToDirectoryHandler,
      images,
      deleteGroupHandler,
      // New methods for Add to Directory feature
    }
  }
}
</script>
<style lang="scss">
.image-avatar-1 {
  border-radius: 50px 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  width: 100px;
  margin: 0 auto;
  padding-left: 4px;
}

.appearBox {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
