<template>
  <q-layout view="hHh Lpr lff" container style="height: 100vh">
    <!-- Drawer Component -->
    <q-drawer v-model="drawer" show-if-above :width="200" :breakpoint="500"
      :class="$q.dark.isActive ? 'bg-secondary' : 'bg-secondary'">
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
        <q-list padding>
          <q-item draggable="true" @dragstart="onDragStart" clickable v-ripple class="drag-item">
            <q-item-section avatar>
              <q-icon name="drive_file_rename_outline" />
            </q-item-section>
            <q-item-section>
              Signatures
            </q-item-section>
          </q-item>
          <q-item draggable="true" @dragstart="onDragSignature" clickable v-ripple class="drag-item">
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>
            <q-item-section>
              drag element
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-page>
        <!-- PDF Info Banner -->
        <q-banner v-if="pdf" dense class="bg-dark text-white">
          <div class="text-h6 flex">
            {{ pdf.originalFilename }}
            <q-space />
            <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
            <q-btn flat color="primary" @click="$router.back()">Back</q-btn>
          </div>
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
            <q-space />
            <q-btn flat color="primary" icon="navigate_before" @click="prevPage" :disable="currentPageNum === 1">
              Previous
            </q-btn>
            <q-btn flat color="primary" icon="navigate_next" @click="nextPage" :disable="!hasMore">
              Next
            </q-btn>
          </template>
        </q-banner>

        <!-- PDF Pages Container -->
        <div class="q-pa-md" style="max-height: calc(100vh - 150px); overflow-y: scroll;">
          <q-card flat v-if="pdf" class="my-card">
            <q-card-section class="pages-container">
              <div v-for="page in currentPages" :key="page.pageNumber" class="page-frame">
                <div class="page-number">Page {{ page.pageNumber }}</div>
                <iframe :srcdoc="page.htmlContent" class="html-frame" scrolling="no" frameborder="0"
                  @load="setupIframe($event, page.pageNumber)" ref="iframes" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
    <q-drawer
        side="right"
        v-model="drawerLeft"
        show-if-above
        :width="250"
        :breakpoint="700"

        class="bg-secondary text-dark"
      >
        <q-scroll-area class="fit">
          <router-view />
        </q-scroll-area>
      </q-drawer>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { date } from 'quasar'
import { useRoute } from 'vue-router'
import { pdfService } from 'boot/pdf_service'
import iframeText from './EditDragFuncs/injectDrag'
import generateUniqueId from './EditDragFuncs/pluggins/uniqueId'
import getIframeCss from './EditDragFuncs/pluggins/cssGetter'
import initContent from './EditDragFuncs/pluggins/initializeIframeItems'
import { useElementsStore } from 'stores/elements'

export default defineComponent({
  name: 'SinglePDFView',
  setup() {
    // Core state management
    const drawer = ref(false)
    const route = useRoute()
    const pdf = ref(null)
    const currentPages = ref([])
    const currentPageNum = ref(1)
    const totalPages = ref(0)
    const hasMore = ref(false)
    const observers = ref([])
    const elementsStore = useElementsStore()

    elementsStore.setSet()

    // Status color mapping
    const getStatusColor = (status) => ({
      'uploading': 'warning',
      'processing': 'info',
      'completed': 'positive',
      'failed': 'negative'
    }[status] || 'grey')

    // Date formatting
    const formatDate = (dateString) => date.formatDate(dateString, 'MMMM D, YYYY')

    // Iframe height adjustment
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

    // Drag event handlers
    const onDragStart = (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'signature',
        content: 'Signature',
        from: 'current_user'
      }))
    }

    const onDragSignature = (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'sidebar-element',
        content: 'sidebar-element'
      }))
    }

    // Iframe setup and initialization
    const setupIframe = async (event, pageNumber) => {
      const iframe = event.target
      adjustIframeHeight(event)



      try {
        const iframeCssTxt = await getIframeCss()
        if (iframeCssTxt) {
          const styleElement = document.createElement('style')
          styleElement.type = 'text/css'
          styleElement.textContent = `${iframeCssTxt}`
          iframe.contentDocument.head.appendChild(styleElement)
        }
      } catch (e) {
        console.error('Error fetching iframe CSS:', e)
      }

      const script = document.createElement('script')
      const uidScript = document.createElement('script')
      script.textContent = iframeText(pageNumber)
      uidScript.textContent = `${generateUniqueId}`

      iframe.contentDocument.body.appendChild(uidScript)
      iframe.contentDocument.body.appendChild(script)

      // Get elements from store and convert to format needed by initContent
      const pageElements = elementsStore.elements.get(pageNumber) || []


      initContent(elementsStore, pageNumber, iframe);
      window.addEventListener('message', handleIframeDrop)
    }

    // Handle iframe drop events
    const handleIframeDrop = (event) => {
      if (window.location.origin !== event.origin) return

      if (event.data.type === "update") {
        const { id, position } = event.data.data
        elementsStore.updateElementPosition(id, position)
      }

      if (event.data.type === 'iframe-drop') {
        try {
          const dragData = event.data.data
          if (dragData.type === 'signature') {
            const newElement = {
              content: dragData.content,
              id: event.data.id,
              position: event.data.position,
              timestamp: new Date().toISOString(),
              data: event.data.data
            }

            elementsStore.addElement(newElement)
          }
        } catch (error) {
          console.error('Error handling drop:', error)
        }
      }
    }

    // PDF loading and navigation
    const loadPDFPages = async (page) => {
      try {
        const response = await pdfService.getPDFPages(route.params.id, page)
        currentPages.value = response.pages
        totalPages.value = response.totalPages
        hasMore.value = response.hasMore
        currentPageNum.value = response.currentPage
        elementsStore.setCurrentPage(response.currentPage)
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

    // Lifecycle hooks
    onMounted(() => {
      loadPDF()
    })

    onBeforeUnmount(() => {
      observers.value.forEach(observer => observer.disconnect())
      window.removeEventListener('message', handleIframeDrop)
    })

    return {
      pdf,
      currentPages,
      currentPageNum,
      totalPages,
      hasMore,
      drawer,
      getStatusColor,
      formatDate,
      nextPage,
      prevPage,
      onDragStart,
      setupIframe,
      onDragSignature,
      elementsStore
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

.drag-item {
  cursor: grab;
}

.drag-item:active {
  cursor: grabbing;
}
</style>
