<template>
  <div>
    <div class="bg-dark tabs_shadow">
      <q-tabs v-model="tab" align="justify" narrow-indicator>
        <q-tab class="text-white" name="allDocuments" label="Documents to Sign" />
        <q-tab class="text-teal" name="signed" label="Signed Documents" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="tab" animated transition-prev="scale" transition-next="scale" class="text-center">
      <!-- Documents to Sign Panel -->
      <q-tab-panel style="max-width: 1400px; margin: 0 auto"  name="allDocuments">
        <div class="row items-center justify-between q-mb-md">
          <h5 class="q-mt-none q-mb-none"> All My Drafts </h5>
          <q-btn flat color="secondary" icon="add" label="Create Document" to="/create-sign-request" class="q-px-md" />
        </div>

        <document-grid
          :pdf-documents="pdfFiles"
          @view="viewDocument"
          @download="downloadDocument"
        />

        <div v-if="!pdfFiles.length" class="text-center q-pa-lg">
          <q-icon name="description" size="4rem" color="grey-5" />
          <p class="text-grey-7">No documents waiting for signature</p>
          <q-btn color="secondary" icon="add" label="Create New Document" @click="showCreateModal = true" class="q-mt-sm" />
        </div>
      </q-tab-panel>

      <!-- Signed Documents Panel -->
      <q-tab-panel name="signed">
        <h5 class="q-mt-none">Signed Documents</h5>
        <q-table :rows="signedDocuments" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 10 }">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat round color="info" icon="visibility" @click="viewDocument(props.row.id)" />
                <q-btn flat round color="secondary" icon="download" @click="downloadDocument(props.row.id)" />
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>

import DocumentGrid from 'src/components/signDoc/GridDocuments.vue';

export default {
  name: 'DocumentSigningPage',
  components: {
    DocumentGrid
  },

  data() {
    return {
      tab: 'allDocuments',
      pdfFiles: [],
      signedDocuments: [
        {
          id: 1,
          name: 'Contract X',
          signedDate: '2024-11-20',
          signers: ['John Doe', 'Jane Smith']
        }
      ],
      columns: [
        { name: 'name', label: 'Document Name', field: 'name', align: 'left' },
        { name: 'signedDate', label: 'Signed Date', field: 'signedDate', align: 'left' },
        {
          name: 'signers',
          label: 'Signers',
          field: 'signers',
          format: val => val.join(', '),
          align: 'left'
        },
        { name: 'actions', label: 'Actions', align: 'center' }
      ]
    }
  },

  async created() {
    try {
      const pdfs = await this.$pdf_service.getAllPDFs()
      this.pdfFiles = pdfs
      console.log('Loaded PDF documents:', this.pdfFiles)
    } catch (error) {
      this.$q.notify({
        color: 'negative',
        message: 'Failed to load documents',
        icon: 'warning'
      })
    }
  },

  methods: {
    viewDocument(docId) {
      console.log('Viewing document:', docId)
    },
    downloadDocument(docId) {
      console.log('Downloading document:', docId)
    }
  }
}
</script>
