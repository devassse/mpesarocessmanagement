<template>
  <div class="main-div ">
    <div class="q-pa-none">
      <div class="bg-dark">
        <q-card class="bg-dark q-pt-xl" style="border:0" flat>
          <div class="image-avatar-1 bg-secondary" style="border-radius: 100%; ">
            <img :src="images.catalog" class="appearBox"
              style="position: absolute; object-position: fit; height: 60%; width: 60%">
          </div>

          <q-card-section class="text-center q-pt-sm text-white appearBox">
            <div class="text-h6">M-Pesa Business Catalog</div>
            <div class="text-caption">you ensure that your code is future-proof and more readable</div>
          </q-card-section>

        </q-card>
      </div>
      <div class="bg-secondary text-white ">
        <q-toolbar class="bg-dark">
          <div class="text-subtitle text-white">Sponsored by: M-Pesa Ops</div>
          <q-space></q-space>
          <q-btn v-if="isAdmin || isEditor" label="Add folder" no-caps flat color="primary" @click="prompt = true" dense icon="folder"/>
          <q-btn v-if="isAdmin || isEditor" label="Add file" no-caps flat :to="`/content-managment`" dense icon="description"
            class="q-ml-sm" />
        </q-toolbar>
        <q-toolbar class="bg-accent text-dark q-pl-md ">
          <q-breadcrumbs class="appearBox" active-color="dark" style="font-size: 14px">
            <q-breadcrumbs-el label="Home" icon="home" />
            <q-breadcrumbs-el label="Main Page" icon="widgets" />
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
      <div class="col-3 bg-grey-2" style="height: calc(100vh - 300px)">
        <DirectoryTree />
      </div>

      <!-- Scroll Area Column -->
      <div class="col-9">
        <q-scroll-area class="bg-accent" style="height: calc(100vh - 300px)">
          <div class="flex flex-start bg-accent appearBox2">
            <div style="width: 100%;">
              <div class="q-pa-md row items-start q-gutter-md vertical-top">
                <q-btn v-for="dir in directories" :key="dir._id" :data-folder-id="dir._id" unelevated
                  :label="dir.name.substring(0, 10)" class="dir-buttons appearBox2" stack color="grey-2"
                  text-color="dark" style="width: 120px;" :to="'/dir/' + dir._id" no-caps>
                  <q-avatar square size="42px">
                   <FolderImage :folderName="dir.name" ></FolderImage>
                  </q-avatar>
                  <q-tooltip>
                    {{ dir.name }}
                  </q-tooltip>
                </q-btn>
                <q-btn v-for="dir in files" :key="dir._id" :data-file-id="dir._id" style="width: 120px;"
                  class="file-buttons" :label="dir.name.substring(0, 10)" unelevated stack no-caps color="grey-2"
                  text-color="dark" :to="'/files/' + dir._id">
                  <q-avatar square size="42px">
                    <img :src="images.writing">
                  </q-avatar>
                  <q-tooltip class="text-orange">
                    {{ dir.name }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </div>
    </div>
    <FolderContextMenu :permissions="currentPermissions.data" ref="dir_context" :folderId="currentFolder.data"
      :deleteFolder="deleteFolder" :directoryId="currentFolder.data" />
    <FileContextMenu v-if="isAdmin || isEditor" ref="file_context" :editFile="editFile" :file="currentFile"
      :deleteFile="deleteFile" />
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

  </div>
</template>

<script>
import { ref, onMounted } from "vue"
import FolderContextMenu from "../components/dir/FolderContextMenu.vue"
import FileContextMenu from "../components/dir/FileContextMenu.vue"
import DirectoryTree from "../components/dir/DirectoryTree.vue"
import Cookies from "js-cookie"
import images from "src/boot/images"
import FolderImage from "src/components/dir/utils/FolderImage.vue"

export default {
  components: {
    FolderContextMenu,
    FileContextMenu,
    DirectoryTree,
    FolderImage,
  },
  data() {
    return {
      directories: [],
      files: [],
      currentPermissions: { data: [] },
    }
  },
  setup() {

    const isElectron = ref(false)
    const isAdmin = ref(false)
    const isViewer = ref(false)
    const isAuditor = ref(false)
    const isEditor = ref(false)

    onMounted(async () => {
      isElectron.value = !!window.electronAPI
      await initializeRoles()
    })

    const getCookie = async (name) => {
      if (isElectron.value) {
        return await window.electronAPI.getCookie(name)
      } else {
        return Cookies.get(name)
      }
    }

    const initializeRoles = async () => {
      isAdmin.value = (await getCookie('isAdmin')) === 'true'
      isViewer.value = (await getCookie('isViewer')) === 'true'
      isAuditor.value = (await getCookie('isAuditor')) === 'true'
      isEditor.value = (await getCookie('isEditor')) === 'true'
    }


    return {
      dir_context: ref(""),
      file_context: ref(""),
      searchText: ref(""),
      currentFile: ref({ data: "" }),
      folderName: ref(""),
      prompt: ref(false),
      currentFolder: ref({ data: "" }),
      isAdmin,
      isViewer,
      isAuditor,
      isEditor,
      images
    }
  },

  methods: {
    hideContext() {
      if (!this.file_context?.$el.classList.contains("none")) {
        this.file_context.$el.style.display = "none"
      }
      if (!this.dir_context?.$el.classList.contains("none")) {
        this.dir_context.$el.style.display = "none"
      }
    },
    onDirContextMenu() {
      let currentFolder = this.currentFolder
      let directories = this.directories
      let currentPermissions = this.currentPermissions
      document.querySelectorAll(".dir-buttons").forEach(btn => {
        btn.addEventListener("contextmenu", e => {
          e.preventDefault()
          this.hideContext()
          let clientX = e.clientX;
          let clientY = e.clientY;

          currentFolder.data = btn.dataset.folderId
          let folderData = directories.find(d => d._id == currentFolder.data)
          currentPermissions.data = folderData.permissions
          // Calculate the absolute position
          this.dir_context.$el.style.display = "block"
          this.dir_context.$el.classList.add('appearBox');
          this.dir_context.$el.style.transform = `translate(${clientX + window.scrollX + "px"}, ${clientY + window.scrollY + "px"})`;
          setTimeout(() => {
            this.dir_context.$el.classList.remove('appearBox');
          }, 300)

        })
      })
    },
    onFileContextMenu() {
      let currentFile = this.currentFile
      let files = this.files
      document.querySelectorAll(".file-buttons").forEach(btn => {
        btn.addEventListener("contextmenu", e => {
          e.preventDefault()
          this.hideContext()
          let clientX = e.clientX;
          let clientY = e.clientY;

          currentFile.data = btn.dataset.fileId
          currentFile.obj = files.filter(file => file._id == btn.dataset.fileId);
          // Calculate the absolute position
          this.file_context.$el.style.display = "block"
          this.file_context.$el.classList.add('appearBox');
          this.file_context.$el.style.transform = `translate(${clientX + window.scrollX + "px"}, ${clientY + window.scrollY + "px"})`;
          setTimeout(() => {
            this.file_context.$el.classList.remove('appearBox');
          }, 300)
        })
      })
    },
    async editFile() {
      this.$router.push("/edit-file/" + this.currentFile.data)
    },
    async deleteFile() {
      try {
        await this.$directories.deleteFileById(this.currentFile.data);
        this.files = this.files.filter(file => file._id !== this.currentFile.data);
        this.hideContext();
      } catch (error) {
        console.error('Error deleting file:', error.message);
      }
    },
    async deleteFolder() {
      try {
        await this.$directories.deleteDirectoryById(this.currentFolder.data);
        this.directories = this.directories.filter(dir => dir._id !== this.currentFolder.data);
        this.hideContext();
      } catch (error) {
        console.error('Error deleting folder:', error.message);
      }
    },
    async addFolder() {
      if (!this.folderName) return;

      try {
        const newFolder = await this.$directories.createDirectory({ name: this.folderName });
        this.directories.push(newFolder);
        this.folderName = '';
        this.prompt = false;
      } catch (error) {
        console.error('Error adding folder:', error.message);
      }
    }
  },
  async created() {
    try {
      const data = await this.$directories.getRootItems();
      console.log(data)
      this.dirFuncs = this.$directories
      this.directories = data.directories;
      this.files = data.files
      console.log(data)
    } catch (error) {
      console.error('Error fetching root items:', error.message);
    }

    let dirContextMenu = this.onDirContextMenu
    let fileContextMenu = this.onFileContextMenu
    setTimeout(() => {
      dirContextMenu()
      fileContextMenu()
      // Context Remove
      setTimeout(() => {
        document.querySelector(".main-div").addEventListener("click", (e) => {
          this.hideContext()
        })
      }, 100)


    }, 100)
  },
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
