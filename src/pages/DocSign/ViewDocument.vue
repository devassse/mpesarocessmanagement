<template>
  <q-banner v-if="pdf" dense class="bg-dark text-white">

      <div class="text-h6 flex">{{ pdf.originalFilename }}  <q-space/>   <q-btn flat color="primary"  @click="$router.back()">
        Back
      </q-btn></div>
      <div class="text-subtitle2">{{ formatDate(pdf.createdAt) }}</div>
      <span class="text-caption">Page {{ currentPageNum }} of {{ totalPages }}</span>
      <div class="q-pa-sm"></div>


    <template v-slot:action>
      <div class="status-info">
          <q-badge :color="getStatusColor(pdf.status)">
            {{ pdf.status }}
          </q-badge>
          <span class="q-ml-sm">{{ pdf.totalPages }} pages</span>
        </div>
        <q-space/>
      <q-btn
          flat
          color="primary"
          icon="navigate_before"
          @click="prevPage"
          :disable="currentPageNum === 1"
        >
          Previous
        </q-btn>
        <q-btn
        flat
        color="primary"
        icon="navigate_next"
        @click="nextPage"
        :disable="!hasMore"
      >
        Next
      </q-btn>
    </template>
  </q-banner>
  <div class="q-pa-md" style="max-height: calc( 100vh - 150px ); overflow-y: scroll;">
    <q-card flat v-if="pdf" class="my-card">



      <q-card-section class="pages-container">
        <div v-for="page in currentPages" :key="page.pageNumber" class="page-frame">
          <div class="page-number">Page {{ page.pageNumber }}</div>
          <iframe
            :srcdoc="page.htmlContent"
            class="html-frame"
            scrolling="no"
            frameborder="0"
            @load="adjustIframeHeight($event)"
            ref="iframes"
          />
        </div>
      </q-card-section>

    </q-card>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { date } from 'quasar'
import { useRoute } from 'vue-router'
import { pdfService } from 'boot/pdf_service'

export default defineComponent({
  name: 'SinglePDFView',
  setup() {
    const route = useRoute()
    const pdf = ref(null)
    const currentPages = ref([])
    const currentPageNum = ref(1)
    const totalPages = ref(0)
    const hasMore = ref(false)
    const observers = ref([])

    const getStatusColor = (status) => ({
      'uploading': 'warning',
      'processing': 'info',
      'completed': 'positive',
      'failed': 'negative'
    }[status] || 'grey')

    const formatDate = (dateString) => date.formatDate(dateString, 'MMMM D, YYYY')

    const adjustIframeHeight = (event) => {
      const iframe = event.target
      const resizeObserver = new ResizeObserver(() => {
        const doc = iframe.contentDocument
        if (doc) {
          const height = doc.documentElement.scrollHeight
          iframe.style.height = `${height}px`
        }
      })

      resizeObserver.observe(iframe.contentDocument.documentElement)
      observers.value.push(resizeObserver)

      const doc = iframe.contentDocument
      if (doc) {
        const height = doc.documentElement.scrollHeight
        iframe.style.height = `${height}px`
      }
    }

    const loadPDFPages = async (page) => {
      try {
        const response = await pdfService.getPDFPages(route.params.id, page)
        currentPages.value = response.pages
        totalPages.value = response.totalPages
        hasMore.value = response.hasMore
        currentPageNum.value = response.currentPage
      } catch (error) {
        console.error('Failed to load PDF pages:', error)
      }
    }

    const loadPDF = async () => {
      try {
        pdf.value = await pdfService.getSinglePDF(route.params.id)
        await loadPDFPages(1)
      } catch (error) {
        console.error('Failed to load PDF:', error)
      }
    }

    const nextPage = () => {
      if (hasMore.value) {
        loadPDFPages(currentPageNum.value + 1)
      }
    }

    const prevPage = () => {
      if (currentPageNum.value > 1) {
        loadPDFPages(currentPageNum.value - 1)
      }
    }

    onMounted(loadPDF)

    onBeforeUnmount(() => {
      observers.value.forEach(observer => observer.disconnect())
    })

    return {
      pdf,
      currentPages,
      currentPageNum,
      totalPages,
      hasMore,
      getStatusColor,
      formatDate,
      nextPage,
      prevPage,
      adjustIframeHeight
    }
  }
})
</script>

<style scoped>
.my-card {
  max-width: 800px;
  margin: 0 auto;
}

.status-info {
  display: flex;
  align-items: center;
}

.pages-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-frame {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.page-number {
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.html-frame {
  width: 100%;
  border: none;
  min-height: 100px;
}
</style>
