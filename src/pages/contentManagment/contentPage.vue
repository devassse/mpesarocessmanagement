<template>

  <q-banner inline-actions class="text-white bg-secondary">
    Uppload Icons to cloud and edit your page as desired
    <template v-slot:action>
      <q-file standout style="max-width: 600px;" max-file-size="209715200" multiple label-color="white"  color="white" dense v-model="model" label="UPLOAD ADITIONAL FILES">
        <template v-slot:prepend>
          <q-icon color="white"  name="cloud_upload" />
        </template>
      </q-file>

      <q-btn flat color="white" @click="createFile" icon="save" label="create" />
    </template>
  </q-banner>
  <div class="q-pa-sm row items-start">
    <q-card class="my-card"  >
      <div class="q-ml-md q-mt-sm text-overline text-orange-9" style="display: flex; align-items:center">
        <div>
          SUBJECT: {{ label }}
          <q-popup-edit v-model="label" auto-save v-slot="scope">
            <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
          </q-popup-edit>
        </div>
        <q-icon class="q-ml-xs text-orange-9" size="xs" name="draw" ></q-icon>
      </div>
      <div v-for="(item, index) in items" :key="item">
        <q-card-section :class="item.label">
          <div style="display: flex;">
            <div class="text-h6 q-mt-sm q-mb-xs q-mr-auto text-negative">{{item.subtitle}}</div>
            <q-btn @click="deleteItem(index)" flat round color="red" icon="delete" />

          </div>
          <div :class="`q-mb-md inner-html-${item.label}`"></div>
          <div style="display:flex; align-items: center;">
            <EditContent :item="item" :index="index" :updateText="updateText" :updateSubtitle="updateSubtitle" :updateBPMN="updateBPMN"/>
          </div>
        </q-card-section>
        <q-separator></q-separator>
      </div>
    </q-card>

  </div>
</template>

<script>
import { ref,onMounted, watch } from 'vue'
import EditContent from "../../components/editor/editContent.vue"
export default {
  components: {
    EditContent
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    updateText: {
      type: Function,
    },
    createFile: {
      type: Function
    },
    updateSubtitle: {
      type: Function
    },
    updateBPMN: {
      type: Function
    },
    getMultipleFiles: {
      type: Function
    },
    deleteItem: {
      type: Function
    },
    updateSubject: {
      type: Function
    },
    subject: {
      type: String
    }
  },
  setup (props) {
    const model = ref("")
    const label = ref(props.subject)
    onMounted(() => {
      props.items.map((ele)=> {
        document.querySelector(`.inner-html-${ele.label}`).innerHTML = ele.text
      })
    });



    watch(model, (newValue)=> {
      if (newValue) {
        // proxy.$editorCloudF.uploadFiles(newValue);
        props.getMultipleFiles(newValue)
      }
    })

    watch(label, (newValue) => {
      if(newValue) {
        props.updateSubject(newValue)
      }
    })



    return {
      label,
      model
    }
  }
}

</script>

<style lang="scss" scoped>
.my-card {
  width: 100%
}
</style>
