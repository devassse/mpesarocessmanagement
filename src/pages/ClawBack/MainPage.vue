<template>
  <div>
    <div class="bg-dark tabs_shadow">
      <!-- <q-card class="bg-dark q-pt-xl" style="border:0" flat>
        <div class="image-avatar-1 bg-white" style="border-radius: 100%;">
          <img :src="images.corruption" class="appearBox"
            style="position: absolute; object-position: fit; height: 60%; width: 60%">
        </div>
      </q-card> -->
      <q-tabs
        v-model="tab"
        align="justify"
        narrow-indicator

      >
        <q-tab class="text-white" name="charts" label="Charts" />
        <q-tab class="text-orange" name="datatable" label="Data table" />
        <q-tab class="text-teal" name="management" label="Management" />
      </q-tabs>
    </div>
    <q-tab-panels
      v-model="tab"
      animated
      transition-prev="scale"
      transition-next="scale"
      class="text-center"
    >
      <q-tab-panel name="charts" style="height: calc( 100vh - 50px ); overflow-y:scroll;">
            <ChartData />
      </q-tab-panel>
      <q-tab-panel name="datatable"  style="height: calc( 100vh - 50px ); overflow-y:scroll;">
        <TableData />
      </q-tab-panel>
      <q-tab-panel name="management"  style="height: calc( 100vh - 50px ); overflow-y:scroll;">
          <q-card v-if="isManager" style="width: 300px; margin:10rem auto" flat>
            <q-img style="height: 200px; width: 200px; margin: auto" :src="images.website"></q-img>
            <p class="text-h6"> You Have no permissions</p>
          </q-card>
          <ManagementPage v-else />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import images from 'src/boot/images';
import ChartData from 'src/components/Clawback/ChartData.vue';
import ManagementPage from 'src/components/Clawback/ManagementPage.vue';
import TableData from 'src/components/Clawback/TableData.vue';
import { ref } from 'vue'



export default {
  components: {
    TableData, ChartData, ManagementPage
  },
  setup() {
    const isManager = ref(false)
    return {
      images,
      tab: ref('datatable'),
      isManager
    }
  }
}
</script>

<style scoped lang="scss">
.image-avatar-1 {
  border-radius: 50px 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  margin: 0 auto;
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
