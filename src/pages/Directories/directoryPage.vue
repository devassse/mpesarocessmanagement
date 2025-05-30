<template>
  <div class="main-div">
    <div class="q-pa-none">
      <div class="bg-dark">
        <q-card class="bg-dark q-pt-xl" style="border:0" flat>
          <div class="image-avatar-1 bg-secondary">
            <img :src="images.catalog" class="appearBox"
              style="position: absolute; object-position: fit; height: 60%; width: 60%">
          </div>

          <q-card-section class="text-center q-pt-sm text-white appearBox">
            <div class="text-h6">M-Pesa Business Catalog</div>
            <div class="text-caption">You ensure that your code is future-proof and more readable</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="bg-secondary text-white">
        <q-toolbar class="bg-dark">
          <div class="text-subtitle text-white">Sponsored by: M-Pesa Ops</div>
          <q-space></q-space>
          <q-btn v-if="hasInviteMemberPermission" label="Create Group" icon="add" no-caps flat color="primary"
            @click="openCreateGroupDialog" />
          <q-btn v-if="hasInviteMemberPermission" label="Add User to Group" icon="group_add" no-caps flat color="primary"
            @click="openAddUserToGroupDialog" />
          <q-btn v-if="hasInviteMemberPermission" label="Add folder" no-caps flat color="primary" icon="folder" @click="prompt = true" />
          <q-btn v-if="hasWritePermission" flat label="Add File" no-caps :to="`/content-managment/${$route.params.dir}`" dense
            icon="description" class="q-ml-sm" />
        </q-toolbar>
        <q-toolbar class="bg-accent text-dark q-pl-md">
          <q-breadcrumbs class="appearBox" active-color="dark" style="font-size: 14px">
            <q-breadcrumbs-el label="Home" icon="home" />
            <q-breadcrumbs-el :label="content.name" icon="folder" />
          </q-breadcrumbs>
          <q-space></q-space>
          <div>
            <q-input v-model="search" filled bg-color="accent" placeholder="search" dense type="search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </q-toolbar>
      </div>
    </div>
    <q-separator></q-separator>
    <div class="row">
      <!-- Directory Tree Column -->
      <div class="col-3 bg-grey-2" style="height: calc(100vh - 300px); overflow: auto;">
        <DirectoryTree @node-selected="handleNodeSelection" />
      </div>

      <!-- Content Column -->
      <div class="col-9">
        <q-scroll-area class="bg-accent" style="height: calc(100vh - 300px)">
          <div class="flex flex-start bg-accent appearBox2">
            <div style="width: 100%;">
              <div class="q-pa-md row items-start q-gutter-md vertical-top">
                <q-btn v-for="dir in directories" :key="dir._id" :data-folder-id="dir._id" unelevated
                  :label="dir.name.substring(0, 10)" class="dir-buttons appearBox2" stack color="grey-2"
                  text-color="dark" style="width: 120px;" :to="'/dir/' + dir._id" no-caps>
                  <q-avatar square size="42px">
                    <FolderImage :folderName="dir.name"></FolderImage>                  </q-avatar>
                  <q-tooltip>
                    {{ dir.name }}
                  </q-tooltip>
                </q-btn>
                <q-btn v-for="file in files" :key="file._id" :data-file-id="file._id" style="width: 120px;"
                  class="file-buttons" :label="file.name.substring(0, 10)" unelevated stack no-caps color="grey-2"
                  text-color="dark" :to="'/files/' + file._id">
                  <q-avatar square size="42px">
                    <img :src="images.writing">
                  </q-avatar>
                  <q-tooltip class="text-orange">
                    {{ file.name }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>

          <q-separator></q-separator>

          <!-- My Groups section -->
          <div class="text-caption q-ml-md q-mt-md">
            My Groups
          </div>
          <div v-if="userGroups.length > 0" class="q-pl-md q-pt-sm row items-start q-gutter-md vertical-top">
            <div  v-for="group in userGroups" :key="group.groupId">
            <q-btn :label="group.groupName" unelevated
              class="group-buttons appearBox2" stack color="primary" text-color="dark" style="width: 120px; min-height: 120px" no-caps
              @click="fetchUsersInGroup(group.groupId)">
              <q-avatar square size="42px">
                <img :src="images.group">
              </q-avatar>

            </q-btn>
            <div class="text-grey" v-for="r in group.roles" :key="r">{{ r }}</div>
            </div>
          </div>
          <div class="q-pl-md q-pt-sm " v-else>
            <q-btn unelevated class="group-buttons appearBox2" stack color="primary" text-color="dark" style="width: 120px; min-height: 120px" no-caps
            >
            <q-avatar square size="42px">
              <img :src="images.error">
            </q-avatar>
            <div>No groups</div>
          </q-btn>
          </div>
        </q-scroll-area>
      </div>
    </div>

    <FolderContextMenu v-if="hasWritePermission" ref="dir_context" :deleteFolder="deleteFolder" :openFolder="openFolder"
      :renameFolder="renameFolder"  :permissions="content.permissions"
      :folderId="currentFolder.data" :directoryId="directoryId" />
    <FileContextMenu v-if="hasWritePermission" ref="file_context" :file="currentFile" :editFile="editFile" :deleteFile="deleteFile" />

    <!-- Folder Creation Dialog -->
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Your Folder Name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="folderName" autofocus @keyup.enter="prompt = false" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat color="secondary" @click="addFolder" label="Add Folder" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Group Creation Dialog -->
    <q-dialog v-model="groupPrompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Create New Group</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="groupName" label="Group Name" autofocus @keyup.enter="groupPrompt = false" />
          <q-input dense v-model="groupDescription" label="Description" type="textarea" />
          <q-select dense v-model="groupPermissions" label="Permissions" multiple :options="permissionOptions" />
          <q-select dense v-model="parentGroupId" label="Parent Group (optional)" :options="groupOptions" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat color="secondary" @click="createGroup" label="Create Group" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for adding users to groups -->
    <q-dialog v-model="addUserToGroupPrompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Users to Group</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense v-model="selectedUsers" label="Select Users" multiple :options="availableUsers"
            option-label="username" option-value="_id" />
          <q-select dense v-model="selectedGroups" label="Select Groups"  :options="availableGroups"
            option-label="name" option-value="_id" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat color="secondary" @click="addUsersToGroups" label="Add Users" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to display users in a group -->
    <q-dialog v-model="showUsersInGroupDialog"  persistent>
      <q-card style="width: 100%;">
        <q-card-section>
          <div class="text-h6">{{ selectedGroupName }}</div>
          <div class="text-subtitle2">{{ selectedGroupDescription }}</div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Child Groups</div>
          <q-list>
            <q-item v-for="childGroup in childGroups" :key="childGroup._id" clickable @click="fetchUsersInGroup(childGroup._id)">
              <q-item-section>{{ childGroup.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Users</div>
          <q-list>
            <q-item v-for="user in usersInGroup" :key="user._id">
              <q-item-section>{{ user.username }}</q-item-section>
              <q-item-section>{{ user.email }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="5"
            boundary-links
            @update:model-value="onPageChange"
          />
        </q-card-actions>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Close" color="negative" v-close-popup @click="resetGroupDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { ref, computed } from 'vue';
import FolderContextMenu from "../../components/dir/FolderContextMenu.vue"
import FileContextMenu from "../../components/dir/FileContextMenu.vue"
import DirectoryTree from "../../components/dir/DirectoryTree.vue"
import images from 'src/boot/images';
import FolderImage from 'src/components/dir/utils/FolderImage.vue';


export default {
  components: {
    FolderContextMenu,
    FileContextMenu,
    DirectoryTree,
    FolderImage
  },
  setup() {
    const content = ref({});
    const hasWritePermission = computed(() => {
      return content.value.permissions && content.value.permissions.includes('write');
    });

    const hasInviteMemberPermission = computed(() => {
      return content.value.permissions && content.value.permissions.includes('invite_member');
    });

    const userGroups = ref([]);
    const groupOptions = computed(() => userGroups.value.map(group => ({
      label: group.groupName,
      value: group.groupId
    })));

    const addUserToGroupPrompt = ref(false);
    const selectedUsers = ref([]);
    const selectedGroups = ref([]);
    const availableUsers = ref([]);
    const availableGroups = ref([]);

    const showUsersInGroupDialog = ref(false);
    const usersInGroup = ref([]);
    const selectedGroupName = ref('');
    const selectedGroupDescription = ref('');
    const childGroups = ref([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const selectedGroupId = ref(null);

    return {
      hasInviteMemberPermission,
      dir_context: ref(null),
      file_context: ref(null),
      search: ref(""),
      currentFile: ref({ data: "" }),
      folderName: ref(""),
      prompt: ref(false),
      currentFolder: ref({ data: "" }),
      hasWritePermission,
      content,
      groupPrompt: ref(false),
      groupName: ref(""),
      groupDescription: ref(""),
      groupPermissions: ref([]),
      parentGroupId: ref(null),
      permissionOptions: ['read', 'write', 'delete', 'invite_member'],
      userGroups,
      groupOptions,
      addUserToGroupPrompt,
      selectedUsers,
      selectedGroups,
      availableUsers,
      availableGroups,
      showUsersInGroupDialog,
      usersInGroup,
      selectedGroupName,
      selectedGroupDescription,
      childGroups,
      currentPage,
      totalPages,
      images,
      selectedGroupId
    }
  },
  data() {
    return {
      directories: [],
      files: [],
      groups: [],
      directoryId: this.$route.params.dir
    }
  },
  async created() {
    await this.fetchDirectory();
    await this.fetchUserGroups();
    if (this.hasWritePermission) {
      this.$nextTick(() => {
        this.setupContextMenus();
      });
    }
    console.log(this.files)
  },
  watch: {
    '$route.params.dir': {
      immediate: true,
      handler: 'handleDirectoryChange'
    }
  },
  methods: {
    async handleDirectoryChange(newDirId, oldDirId) {
      if (newDirId !== oldDirId) {
        await this.fetchDirectory(newDirId);
        await this.fetchUserGroups(newDirId);
      }
    },
    openCreateGroupDialog() {
      this.groupPrompt = true;
    },
    async createGroup() {
      if (!this.hasWritePermission || !this.groupName) return;
      const directoryId = this.$route.params.dir;
      const groupData = {
        name: this.groupName,
        description: this.groupDescription,
        userPermissions: this.groupPermissions,
        users: [],
        parentGroupId: this.parentGroupId ? this.parentGroupId.value : null
      };

      try {
        const newGroup = await this.$roles.createGroupInDirectory(directoryId, groupData);
        this.userGroups.push({
          groupId: newGroup._id,
          groupName: newGroup.name,
          roles: newGroup.userPermissions
        });

        this.groupName = '';
        this.groupDescription = '';
        this.groupPermissions = [];
        this.parentGroupId = null;
        this.groupPrompt = false;

        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Group created successfully'
        });
      } catch (error) {
        console.error('Error creating group:', error.message);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to create group: ' + error.message
        });
      }
    },
    async fetchDirectory() {
      const directoryId = this.$route.params.dir;
      try {
        this.content = await this.$directories.getDirectoryById(directoryId);
        this.files = this.content.files;
        this.directories = this.content.children;
        this.groups = this.content.groups || [];
        this.$nextTick(() => {
          if (this.hasWritePermission) {
            this.setupContextMenus();
          }
        });
      } catch (error) {
        console.error('Error fetching directory:', error.message);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to fetch directory: ' + error.message
        });
      }
    },
    async fetchUserGroups() {
      const directoryId = this.$route.params.dir;
      try {
        this.userGroups = await this.$roles.get_current_directory_groups_user_in(directoryId);
        console.log(this.userGroups)
      } catch (error) {
        console.error('Error fetching user groups:', error);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to fetch user groups: ' + error.message
        });
      }
    },
    setupContextMenus() {
      this.onDirContextMenu();
      this.onFileContextMenu();
      document.querySelector(".main-div").addEventListener("click", this.hideContext);
    },
    hideContext() {
      if (this.file_context?.$el) {
        this.file_context.$el.style.display = "none";
      }
      if (this.dir_context?.$el) {
        this.dir_context.$el.style.display = "none";
      }
    },
    onDirContextMenu() {
      document.querySelectorAll(".dir-buttons").forEach(this.attachDirContextMenu);
    },
    attachDirContextMenu(btn) {
      btn.addEventListener("contextmenu", e => {
        e.preventDefault();
        this.hideContext();
        const { clientX, clientY } = e;
        const folderId = btn.dataset.folderId;
        this.showContextMenu(this.dir_context.$el, clientX, clientY, folderId);
      });
    },
    onFileContextMenu() {
      document.querySelectorAll(".file-buttons").forEach(btn => {
        btn.addEventListener("contextmenu", e => {
          e.preventDefault();
          this.hideContext();
          const { clientX, clientY } = e;
          this.currentFile.data = btn.dataset.fileId;
          this.currentFile.obj = this.files.filter(file => file._id == btn.dataset.fileId );
          this.showContextMenu(this.file_context.$el, clientX, clientY);
        });
      });
    },
    showContextMenu(el, x, y, folderId) {
      if (folderId) {
        this.currentFolder.data = folderId;
      }
      el.style.display = "block";
      el.classList.add('appearBox');
      el.style.transform = `translate(${x + window.scrollX}px, ${y + window.scrollY}px)`;
      setTimeout(() => {
        el.classList.remove('appearBox');
      }, 300);
    },
    async deleteFile(fileId) {
      console.log(this.currentFile.data )
      if (!this.hasWritePermission) return;
      try {
        await this.$directories.deleteFileById(this.currentFile.data );
        this.files = this.files.filter(file => file._id !== this.currentFile.data );
        this.hideContext();
      } catch (error) {
        console.error('Error deleting file:', error.message);
      }
    },
    async editFile () {
      this.$router.push("/edit-file/" + this.currentFile.data)
    },
    async deleteFolder(folderId) {
      if (!this.hasWritePermission) return;
      try {
        await this.$directories.deleteDirectoryById(folderId);
        this.directories = this.directories.filter(dir => dir._id !== folderId);
        this.hideContext();
      } catch (error) {
        console.error('Error deleting folder:', error.message);
      }
    },
    openFolder(folderId) {
      this.$router.push(`/dir/${folderId}`);
    },
    async renameFolder(folderId) {
      const newName = prompt('Enter new folder name:');
      if (newName) {
        try {
          await this.$directories.renameDirectory(folderId, newName);
          const folder = this.directories.find(dir => dir._id === folderId);
          if (folder) folder.name = newName;
        } catch (error) {
          console.error('Error renaming folder:', error.message);
        }
      }
    },

    async addFolder() {
      if (!this.hasWritePermission || !this.folderName) return;
      try {
        const newFolder = await this.$directories.createDirectory({
          name: this.folderName,
          parent: this.$route.params.dir
        });
        this.directories.push(newFolder);
        this.folderName = '';
        this.prompt = false;

        this.$nextTick(() => {
          const newFolderElement = document.querySelector(`[data-folder-id="${newFolder._id}"]`);
          if (newFolderElement) {
            this.attachDirContextMenu(newFolderElement);
          }
        });
      } catch (error) {
        console.error('Error adding folder:', error.message);
      }
    },
    handleNodeSelection(node) {
      console.log('Selected node:', node);
      // Implement logic for handling node selection from the DirectoryTree
    },
    openAddUserToGroupDialog() {
      this.addUserToGroupPrompt = true;
      this.fetchAvailableUsersAndGroups();
    },
    async fetchAvailableUsersAndGroups() {
      const directoryId = this.$route.params.dir;
      try {
        this.availableUsers = await this.$roles.getAllUsersInCurrentDirectoryGroup(directoryId);
        const groupsData = await this.$roles.getAllGroupsAndChildrenInDirectory(directoryId);
        this.availableGroups = this.flattenGroups(groupsData);
      } catch (error) {
        console.error('Error fetching users and groups:', error);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to fetch users and groups: ' + error.message
        });
      }
    },
    flattenGroups(groups, parentId = null) {
      let flatGroups = [];
      for (const group of groups) {
        flatGroups.push({
          _id: group.groupId,
          name: group.name,
          parentId: parentId
        });
        if (group.children && group.children.length > 0) {
          flatGroups = flatGroups.concat(this.flattenGroups(group.children, group.groupId));
        }
      }
      return flatGroups;
    },
    async addUsersToGroups() {
      if (this.selectedUsers.length === 0 || this.selectedGroups.length === 0) {
        this.$q.notify({
          color: 'warning',
          textColor: 'white',
          icon: 'warning',
          message: 'Please select both users and groups'
        });
        return;
      }

      const directoryId = this.$route.params.dir;
      console.log(directoryId)

      try {

        await this.$roles.addUsersToGroupFromDirectory(directoryId, this.selectedGroups._id, this.selectedUsers.map(user => user.userId));


        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'check_circle',
          message: 'Users added to groups successfully'
        });

        this.addUserToGroupPrompt = false;
        this.selectedUsers = [];
        this.selectedGroups = [];
        await this.fetchUserGroups();
      } catch (error) {
        console.error('Error adding users to groups:', error);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'Failed to add users to groups: ' + error.message
        });
      }
    },
    async fetchUsersInGroup(groupId, page = 1) {
      try {
        this.selectedGroupId = groupId;
        const groupResponse = await this.$roles.getUsersInGroup(groupId, page);

        this.usersInGroup = groupResponse.users;
        this.selectedGroupName = groupResponse.group.name;
        this.selectedGroupDescription = groupResponse.group.description;
        this.childGroups = groupResponse.group.children || [];
        this.currentPage = groupResponse.currentPage;
        this.totalPages = groupResponse.totalPages;

        this.showUsersInGroupDialog = true;
      } catch (error) {
        console.error('Error fetching users in group:', error);
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Failed to fetch users in group: ' + error.message
        });
      }
    },
    async onPageChange(newPage) {
      await this.fetchUsersInGroup(this.selectedGroupId, newPage);
    },
    resetGroupDialog() {
      this.selectedGroupId = null;
      this.currentPage = 1;
      this.usersInGroup = [];
      this.childGroups = [];
      this.selectedGroupName = '';
      this.selectedGroupDescription = '';
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
</style>
