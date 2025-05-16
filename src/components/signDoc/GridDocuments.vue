<template>
  <div class="row q-col-gutter-md">
    <div  v-for="doc in pdfDocuments" :key="doc.jobId" class="col-xs-12 col-sm-6 col-md-4">
      <q-card bordered flat class="document-card bg-grey-2 q-pa-none">
        <q-card-section v-if="doc.cover?.htmlFile?.fileId" class="card-cover  q-pa-none">
          <iframe style="" :src="`${baseUrl}/get_pdf_cover/${doc.cover.htmlFile.fileId}?authToken=${token}`"
            class="cover-frame" scrolling="no" frameborder="0"></iframe>
        </q-card-section>


          <q-item class="q-pt-lg">
            <q-item-section side left >
              <q-item-label >
                <div class="text-truncate text-dark" :title="doc.originalFilename">
                  {{ truncateFilename(doc.originalFilename) }}
                </div>
              </q-item-label> <q-item-label caption>{{ formatDate(doc.startTime) }}</q-item-label>
              <q-item-label caption> Pages: {{ doc.totalPages }} </q-item-label>
            </q-item-section>
            <q-space/>

          </q-item>

        <q-card-actions align="right" >
          <q-btn icon="download" unelevated  @click="$emit('download', doc)">  </q-btn>
          <q-btn
          :to="`/edit_document/${doc._id}`"
          color="dark"
          unelevated
        >
          Open
        </q-btn>

        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { date } from 'quasar'
import ip from 'src/boot/ips'
import Cookies from 'js-cookie';

export default defineComponent({
  name: 'DocumentGrid',
  props: {
    pdfDocuments: {
      type: Array,
      default: () => []
    }
  },
  data() {


    return {
      baseUrl: ip ? `${ip}/pdf-get` : 'http://localhost:3000/pdf-get'
    }
  },
  setup() {
    const token = ref("")
    const getCookie = async (name) => {
      try {
        if (!name || typeof name !== 'string') {
          throw new Error('Invalid cookie name')
        }

        return typeof window !== 'undefined' && !!window.electronAPI
          ? await window.electronAPI.getCookie(name)
          : Cookies.get(name)
      } catch (error) {
        throw new Error(`Failed to get cookie: ${error.message}`)
      }
    }
    getCookie('authToken').then(t => {
      console.log(t)
      token.value = t
    })

    return {
      token,

    }

  },
  emits: ['view', 'download'],
  methods: {
    formatDate(dateString) {
      return date.formatDate(dateString, 'MMMM D, YYYY')
    },
    truncateFilename(filename, maxLength = 40) {
      if (filename.length <= maxLength) return filename;

      const extension = filename.lastIndexOf('.') > 0
        ? filename.slice(filename.lastIndexOf('.'))
        : '';
      const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));

      const truncatedLength = maxLength - extension.length - 3;
      return `${nameWithoutExt.slice(0, truncatedLength)}...${extension}`;
    }
  }
})
</script>

<style>
.card-cover {
  height: 200px;
  overflow: hidden;
}

.cover-frame {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
