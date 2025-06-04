<template>
  <div class="bg-accent">
  <q-header :class="$q.dark.isActive ? 'bg-dark' : 'bg-dark'">
    <q-toolbar>
      <q-btn flat @click="toggleDrawer"  style="rotate: 90deg;" round dense icon="leaderboard" />
      <div class="text-weight-bold q-mr-auto q-ml-md">{{ file.name }}</div>
      <q-btn flat round dense icon="arrow_back" @click="goBack" />
    </q-toolbar>
  </q-header>
  <q-layout view="hHh Lpr lff" container style="height: 100vh" >
  <DraweComponent :gridFSFileInfos="file.gridFSFileInfos" :file="file" :drawer="drawer" />
  <q-page-container style="padding: 0;">
    <q-page style="padding: 0;">
      <q-card  flat>
        <q-tabs
          v-model="tab"
          dense
          class="text-secondary "
          active-color="dark"
          indicator-color="dark"
          align="justify"
          narrow-indicator
        >
          <q-tab class="bg-accent" v-for="content in file.content" :key="content._id" :name="content._id" :label="content.subtitle" />
        </q-tabs>

        <q-separator />

        <q-tab-panels class="bg-grey-2" v-model="tab" animated>
          <q-tab-panel v-for="(content, index) in file.content" :key="`my${content._id}`" :name="content._id">
            <q-card-section class="bg-grey-2">

              <div class="text-body innerHTML" v-html="content.text"></div>
              <BpmnModeler v-if="content.BPMN_string" :index="index" :bpmnXML="content.BPMN_string" />
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-page>
  </q-page-container>
  </q-layout>
</div>
</template>

<script>
import BpmnModeler from './BpmnModeler.vue'; // Adjust the path as needed
import { ref } from 'vue';
import DraweComponent from "../../components/readFile_/LeftDrawer.vue"
import { useRoute, useRouter } from 'vue-router';
export default {
  data() {
    return {
      drawerLeft: false,
      file: {
        content: [] // Ensure the content array is initialized
      },

      bpmnString: '',
      tab: ''
    }
  },

  async created() {
    const fileId = this.$route.params.file; // Assuming you pass the file ID through the route
    try {
      this.file = await this.$directories.getFileById(fileId)
      console.log(this.file)
      this.tab = this.file.content[0]._id

    } catch (error) {
      console.error('Error fetching file:', error.message);
    }
  },
  methods: {
    bgClass(name) {
      // Add logic to determine the background class based on the name or any other property
      return 'bg-secondary text-white';
    },

  },
  setup() {
    const router = useRouter();


    const goBack = () => {
      router.go(-1)
    }
    const drawer = ref(false)

    const toggleDrawer = () => {
      drawer.value = !drawer.value
    }

    return {
      drawer,
      toggleDrawer,
      goBack,

    }
  },
  components: {
    DraweComponent,
    BpmnModeler
  }
}
</script>

<style>
.my-card {
  width: 96%;
  margin: 20px;
}
</style>
