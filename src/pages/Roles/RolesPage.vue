<template>
  <div class="row q-pa-md bg-accent appearBox2" style="min-height: 100vh">
    <div class="col-8">
      <q-card class="bg-white q-pt-xl" flat>
        <div class="image-avatar-1 bg-dark" style="border-radius: 100%; height: 150px; width: 150px">
          <img :src="images.team" style="position: absolute; object-position: fit; height: 70%; width: 70%">
        </div>

        <q-card-section class="text-center q-pt-sm text-dark">
          <div class="text-h6">User Roles</div>
          <div class="text-caption" style="max-width: 600px; margin: 0 auto">Define and manage the responsibilities and
            access levels of your team with the User Roles section. This feature allows you to assign specific roles to
            users, ensuring everyone has the appropriate permissions to perform their tasks effectively.</div>
        </q-card-section>
        <div>
          <q-input v-model="search" filled bg-color="white" placeholder="search" dense type="search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-separator color="grey-4"></q-separator>
        </div>

        <q-markup-table dense flat>
          <thead class="q-pt-md q-pb-md">
            <tr>
              <th class="text-left">User Name</th>
              <th class="text-left">Roles</th>
              <th class="text-left">Groups</th>
              <th class="text-left">Ticket Id</th>
              <th class="text-left">Department</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.username" @click="selectUser(user.username)"
              class="cursor-pointer hover-highlight">
              <td class="text-left">{{ user.username }}</td>
              <td class="text-left">{{ user.roles.join(', ') }}</td>
              <td class="text-left">{{ user.groups.map(g => g.name).join(', ') }}</td>
              <td class="text-left">{{ user.ticketId }}</td>
              <td class="text-left">{{ user.department }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="q-pa-lg flex flex-center">
          <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-links />
        </div>
      </q-card>
    </div>
    <div class="col-4 q-pl-md">
      <q-card flat class="bg-dark text-white">
        <q-card-section>
          <div class="text-h6">User Roles</div>
        </q-card-section>

        <div v-if="selectedUser" class="q-gutter-sm q-pl-md text-caption q-pb-md"
          style="display: flex; flex-direction: column">
          <q-checkbox v-for="role in availableRoles" :key="role" dense v-model="selectedUser.roles" :val="role" dark
            :label="role" color="secondary" />
        </div>
        <div v-else class="q-pa-md text-center">
          No user selected
        </div>

        <q-card-actions>
          <q-space></q-space>
          <q-btn color="grey-3" flat label="Save" align="left" icon="save" @click="saveUserRoles"
            :disable="!selectedUser" />
          <q-btn flat color="grey-3" label="Reset" align="left" @click="resetUserRoles" :disable="!selectedUser" />
        </q-card-actions>
      </q-card>
      <q-card v-if="selectedUser" flat class="bg-white text-dark q-mt-md q-pt-md">
        <div class="image-avatar-1 bg-secondary" style="border-radius: 100%; ">
          <img :src="images.programmer" style="position: absolute; object-position: fit; height: 60%; width: 60%">
        </div>

        <q-card-section class="text-center q-pt-sm text-dark">
          <div class="text-h6">{{ selectedUser.username }}</div>
          <div class="text-caption">{{ selectedUser.email }}</div>
        </q-card-section>
      </q-card>
      <q-card v-else flat class="bg-white text-dark q-mt-md q-pt-md">
        <q-card-section class="text-center q-pt-sm text-dark">
          <div class="text-h6">No User Selected</div>
          <div class="text-caption">Select a user to view details</div>
        </q-card-section>
      </q-card>
      <q-card v-if="selectedUser" flat class="bg-white text-dark q-mt-md q-pt-md">
        <div class="image-avatar-1 bg-secondary" style="border-radius: 100%; ">

          <img v-if="selectedUser.status === 'Active'" :src="images.unlocked"
            style="position: absolute; object-fit: contain; height: 60%; width: 60%">
          <img v-else :src="images.lock" style="position: absolute; object-fit: contain; height: 60%; width: 60%">

        </div>

        <q-card-section class="text-center q-pt-sm text-dark">
          <div class="text-h6">{{ selectedUser.status === 'Active' ? 'Deactivate' : 'Activate' }} Account</div>
          <div class="text-caption">Current status: {{ selectedUser.status }}</div>
          <q-btn :color="selectedUser.status === 'Active' ? 'negative' : 'positive'" flat no-caps
            :label="selectedUser.status === 'Active' ? 'Deactivate' : 'Activate'" @click="toggleUserStatus"
            :loading="statusLoading" />
        </q-card-section>
      </q-card>
      <q-card v-if="selectedUser" flat class="bg-white text-dark q-mt-md q-pt-md">
        <div class="image-avatar-1 bg-primary" style="border-radius: 100%;">
          <img :src="images.group" style="position: absolute; object-position: fit; height: 60%; width: 60%">
        </div>

        <q-card-section class="text-center q-pt-sm text-dark">
          <div class="text-h6">User Groups</div>
          <div class="text-caption">Groups that {{ selectedUser.username }} belongs to</div>
        </q-card-section>

        <q-list dense>
          <q-item v-for="group in selectedUser.groups" :key="group.name">
            <q-item-section>
              <q-item-label>{{ group.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round color="negative" icon="remove_circle" @click="removeGroupFromUser(group.name)" />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-if="selectedUser.groups.length === 0" class="text-center">
          <div class="text-caption">This user doesn't belong to any groups</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn color="secondary" label="Add Group" @click="openAddGroupDialog" />
        </q-card-actions>
      </q-card>
    </div>
  </div>

  <!-- Add Group Dialog -->
  <q-dialog v-model="addGroupDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add Group to {{ selectedUser?.username }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select v-model="selectedNewGroups" :options="availableGroups" option-value="name" option-label="name"
          multiple emit-value map-options label="Select Groups" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Add" color="secondary" @click="addGroupsToUser" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getUserRolesAndGroups, getUserByUsername, getAllGroups, addUsersToGroups, assignRolesToUser, removeUserFromGroup, activateUser, deactivateUser } from 'boot/roles'
import images from 'src/boot/images';

export default {
  setup() {
    const $q = useQuasar()
    const search = ref('')
    const users = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalUsers = ref(0)
    const loading = ref(false)
    const selectedUser = ref(null)
    const availableRoles = ref(['Admin', 'View', 'Editor', 'Audit log'])
    const addGroupDialog = ref(false)
    const availableGroups = ref([])
    const selectedNewGroups = ref([])


    const statusLoading = ref(false)

    const toggleUserStatus = async () => {
      if (!selectedUser.value) return

      statusLoading.value = true
      const newStatus = selectedUser.value.status === 'Active' ? 'Deactivated' : 'Active'
      const action = newStatus === 'Active' ? 'activate' : 'deactivate'
      try {
        if (newStatus === 'Active') {
          await activateUser(selectedUser.value.username)
          console.log(selectedUser)
        } else {
          await deactivateUser(selectedUser.value.username)
          console.log(selectedUser)
        }

        selectedUser.value.status = newStatus

        // Update the user in the users list
        const userIndex = users.value.findIndex(u => u.username === selectedUser.value.username)
        if (userIndex !== -1) {
          users.value[userIndex].status = newStatus
        }

        $q.notify({
          color: 'positive',
          position: 'top',
          message: `User ${action}d successfully`,
          icon: 'check_circle'
        })
      } catch (error) {
        console.error(`Error ${action}ing user:`, error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: `Failed to ${action} user. Please try again.`,
          icon: 'report_problem'
        })
      } finally {
        statusLoading.value = false
      }
    }


    const fetchUsers = async (page) => {
      loading.value = true
      try {
        const data = await getUserRolesAndGroups(page)
        users.value = data.users
        console.log(data)
        currentPage.value = data.currentPage
        totalPages.value = data.totalPages
        totalUsers.value = data.totalUsers
      } catch (error) {
        console.error('Error fetching users:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to load users. Please try again.',
          icon: 'report_problem'
        })
      } finally {
        loading.value = false
      }
    }

    const selectUser = async (username) => {
      loading.value = true
      try {
        const userData = await getUserByUsername(username)
        selectedUser.value = userData
        // Fetch the user's groups from the users array
        const userInList = users.value.find(u => u.username === username)
        if (userInList) {
          selectedUser.value.groups = userInList.groups
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to load user details. Please try again.',
          icon: 'report_problem'
        })
      } finally {
        loading.value = false
      }
    }

    const saveUserRoles = async () => {
      if (!selectedUser.value) return

      try {
        const result = await assignRolesToUser({
          username: selectedUser.value.username,
          roles: selectedUser.value.roles
        });

        // Update the user in the users list
        const userIndex = users.value.findIndex(u => u.username === selectedUser.value.username)
        if (userIndex !== -1) {
          users.value[userIndex].roles = result.user.roles
        }

        $q.notify({
          color: 'positive',
          position: 'top',
          message: 'User roles updated successfully',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error saving user roles:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to save user roles. Please try again.',
          icon: 'report_problem'
        })
      }
    }

    const resetUserRoles = () => {
      if (selectedUser.value) {
        selectUser(selectedUser.value.username)
      }
    }



    const openAddGroupDialog = async () => {
      try {
        const groups = await getAllGroups()
        availableGroups.value = groups.filter(group =>
          !selectedUser.value.groups.some(userGroup => userGroup.name === group.name)
        )
        addGroupDialog.value = true
      } catch (error) {
        console.error('Error fetching groups:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to load groups. Please try again.',
          icon: 'report_problem'
        })
      }
    }

    const addGroupsToUser = async () => {
      if (!selectedUser.value || selectedNewGroups.value.length === 0) return

      try {
        const result = await addUsersToGroups({
          groupNames: selectedNewGroups.value,
          usernames: [selectedUser.value.username]
        });

        // Update the local state based on the API response
        if (result.results && result.results.length > 0) {
          const addedGroups = result.results.flatMap(r => r.usersAdded.includes(selectedUser.value.username) ? [{ name: r.group }] : []);

          selectedUser.value.groups = [
            ...selectedUser.value.groups,
            ...addedGroups
          ];

          // Update the user in the users list as well
          const userIndex = users.value.findIndex(u => u.username === selectedUser.value.username);
          if (userIndex !== -1) {
            users.value[userIndex].groups = selectedUser.value.groups;
          }

          $q.notify({
            color: 'positive',
            position: 'top',
            message: 'Groups added successfully',
            icon: 'check_circle'
          });
        } else {
          throw new Error('No groups were added');
        }

        // Reset selected groups
        selectedNewGroups.value = []

        // Close the dialog
        addGroupDialog.value = false;
      } catch (error) {
        console.error('Error adding groups to user:', error);
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to add groups. Please try again.',
          icon: 'report_problem'
        });
      }
    }

    onMounted(() => {
      fetchUsers(1)
    })

    watch(currentPage, (newPage) => {
      fetchUsers(newPage)
    })

    const filteredUsers = computed(() => {
      if (!search.value) return users.value
      const searchLower = search.value.toLowerCase()
      return users.value.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.roles.some(role => role.toLowerCase().includes(searchLower)) ||
        user.groups.some(group => group.name.toLowerCase().includes(searchLower))
      )
    })


    const removeGroupFromUser = async (groupName) => {
      if (!selectedUser.value) return

      try {
        await removeUserFromGroup(groupName, selectedUser.value.username)

        // Update the local state
        selectedUser.value.groups = selectedUser.value.groups.filter(g => g.name !== groupName)

        // Update the user in the users list as well
        const userIndex = users.value.findIndex(u => u.username === selectedUser.value.username)
        if (userIndex !== -1) {
          users.value[userIndex].groups = selectedUser.value.groups
        }

        $q.notify({
          color: 'positive',
          position: 'top',
          message: `User removed from group ${groupName} successfully`,
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error removing user from group:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to remove user from group. Please try again.',
          icon: 'report_problem'
        })
      }
    }


    return {
      removeGroupFromUser,
      search,
      users,
      currentPage,
      totalPages,
      totalUsers,
      loading,
      filteredUsers,
      selectedUser,
      availableRoles,
      addGroupDialog,
      availableGroups,
      selectedNewGroups,
      selectUser,
      saveUserRoles,
      resetUserRoles,
      toggleUserStatus,
      openAddGroupDialog,
      addGroupsToUser,
      statusLoading,
      images
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

.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
