<template>
  <div class="q-pa-md">
    <q-card flat class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Upload Clawback Data</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- File Upload Section -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Bulk Upload</div>

                <q-file
                  v-model="fileUpload"
                  label="Choose file"
                  filled
                  dense
                  bottom-slots
                  accept=".csv, .xlsx, .xls"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>

                  <template v-slot:hint>
                    CSV or Excel files only
                  </template>
                </q-file>

                <div class="q-mt-sm">
                  <q-btn
                    color="secondary"
                    unelevated
                    dense
                    :disable="!fileUpload"
                    @click="uploadFile"
                    :loading="uploading"
                  >
                    Upload File
                  </q-btn>
                </div>

                <!-- Upload Progress -->
                <q-linear-progress
                  v-if="uploading"
                  :value="uploadProgress"
                  class="q-mt-md"
                  rounded
                  size="10px"
                  color="accent"
                />
              </q-card-section>
            </q-card>

            <!-- Force Update Single Entry -->
            <q-card flat bordered class="q-mt-md">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Force Update Single Entry</div>
                <q-form @submit="onForceUpdate" class="q-gutter-sm">
                  <q-input
                    v-model="forceUpdateData.shortCode"
                    label="Short Code *"
                    filled
                    dense
                    :rules="[val => !!val || 'Short code is required']"
                  />
                  <q-select
                    v-model="forceUpdateData.infractionType"
                    :options="infractionTypes"
                    label="Infraction Type *"
                    filled
                    dense
                    :rules="[val => !!val || 'Infraction type is required']"
                  />
                  <q-input
                    v-model.number="forceUpdateData.amount"
                    label="Clawback Amount *"
                    filled
                    dense
                    type="number"
                    prefix="$"
                    :rules="[
                      val => !!val || 'Amount is required',
                      val => val > 0 || 'Amount must be greater than 0'
                    ]"
                  />
                  <div>
                    <q-btn
                      unelevated
                      dense
                      label="Force Update"
                      type="submit"
                      color="warning"
                      :loading="forceUpdating"
                    />
                    <q-btn
                      label="Clear"
                      type="reset"
                      flat
                      dense
                      class="q-ml-sm"
                      @click="resetForceUpdate"
                    />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>

          <!-- Manual Entry Section -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Manual Entry</div>

                <q-form @submit="onSubmit" class="q-gutter-sm">
                  <q-input
                    v-model="formData.shortCode"
                    label="Short Code *"
                    filled
                    dense
                    :rules="[val => !!val || 'Short code is required']"
                  />

                  <q-input
                    v-model="formData.orgName"
                    label="Organization Name *"
                    filled
                    dense
                    :rules="[val => !!val || 'Organization name is required']"
                  />

                  <q-input
                    v-model="formData.parentOrg"
                    label="Parent Organization *"
                    filled
                    dense
                    :rules="[val => !!val || 'Parent organization is required']"
                  />

                  <q-select
                    v-model="formData.infractionType"
                    :options="infractionTypes"
                    label="Infraction Type *"
                    filled
                    dense
                    :rules="[val => !!val || 'Infraction type is required']"
                  />

                  <q-input
                    v-model.number="formData.amount"
                    label="Clawback Amount *"
                    filled
                    dense
                    type="number"
                    prefix="$"
                    :rules="[
                      val => !!val || 'Amount is required',
                      val => val > 0 || 'Amount must be greater than 0'
                    ]"
                  />

                  <q-input
                    v-model="formData.date"
                    label="Infraction Date *"
                    filled
                    dense
                    type="date"
                    :rules="[val => !!val || 'Date is required']"
                  />

                  <q-input
                    v-model="formData.description"
                    label="Description"
                    type="textarea"
                    filled
                    dense
                  />

                  <div>
                    <q-btn
                      unelevated
                      dense
                      label="Submit"
                      type="submit"
                      color="secondary"
                      :loading="submitting"
                    />
                    <q-btn
                      label="Reset"
                      type="reset"
                      flat
                      dense
                      class="q-ml-sm"
                      @click="resetForm"
                    />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Recent Uploads Table -->
    <q-card flat>
      <q-card-section>
        <div class="text-h6">Recent Uploads</div>
      </q-card-section>

      <q-table
        :rows="recentUploads"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        bordered
        dense
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="timestamp" :props="props">
              {{ formatDate(props.row.timestamp) }}
            </q-td>
            <q-td key="type" :props="props">
              <q-badge :color="props.row.type === 'File' ? 'primary' : 'secondary'">
                {{ props.row.type }}
              </q-badge>
            </q-td>
            <q-td key="details" :props="props">
              {{ props.row.details }}
            </q-td>
            <q-td key="status" :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ props.row.status }}
              </q-badge>
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                flat
                round
                size="sm"
                color="primary"
                icon="visibility"
                @click="viewDetails(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- Notifications -->
    <q-dialog v-model="showNotification">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ notificationTitle }}</div>
        </q-card-section>

        <q-card-section>
          {{ notificationMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { date } from 'quasar'

export default {
  setup() {
    const fileUpload = ref(null)
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const submitting = ref(false)
    const forceUpdating = ref(false)
    const loading = ref(false)
    const showNotification = ref(false)
    const notificationTitle = ref('')
    const notificationMessage = ref('')

    const formData = reactive({
      shortCode: '',
      orgName: '',
      parentOrg: '',
      infractionType: null,
      amount: null,
      date: '',
      description: ''
    })

    const forceUpdateData = reactive({
      shortCode: '',
      infractionType: null,
      amount: null
    })

    const infractionTypes = [
      'Unauthorized Transaction',
      'Policy Violation',
      'Fraud',
      'Security Breach',
      'Compliance Violation',
      'Other'
    ]

    const columns = [
      {
        name: 'timestamp',
        required: true,
        label: 'Timestamp',
        align: 'left',
        field: row => row.timestamp,
        sortable: true
      },
      {
        name: 'type',
        label: 'Upload Type',
        field: 'type',
        sortable: true
      },
      {
        name: 'details',
        label: 'Details',
        field: 'details'
      },
      {
        name: 'status',
        label: 'Status',
        field: 'status',
        sortable: true
      },
      {
        name: 'actions',
        label: 'Actions',
        field: 'actions'
      }
    ]

    const recentUploads = ref([
      {
        id: 1,
        timestamp: new Date(),
        type: 'File',
        details: 'clawback_data.xlsx',
        status: 'Completed'
      },
      {
        id: 2,
        timestamp: new Date(),
        type: 'Manual',
        details: 'AG001 - Sample Agency 1',
        status: 'Processing'
      }
    ])

    const uploadFile = async () => {
      uploading.value = true
      uploadProgress.value = 0

      // Simulate file upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        uploadProgress.value = i / 100
      }

      showNotification.value = true
      notificationTitle.value = 'Upload Successful'
      notificationMessage.value = 'File has been processed successfully'

      uploading.value = false
      fileUpload.value = null
    }

    const onSubmit = async () => {
      submitting.value = true

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      showNotification.value = true
      notificationTitle.value = 'Entry Successful'
      notificationMessage.value = 'Data has been saved successfully'

      submitting.value = false
      resetForm()
    }

    const onForceUpdate = async () => {
      forceUpdating.value = true

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      showNotification.value = true
      notificationTitle.value = 'Force Update Successful'
      notificationMessage.value = 'Entry has been force updated successfully'

      forceUpdating.value = false
      resetForceUpdate()
    }

    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        formData[key] = ''
      })
    }

    const resetForceUpdate = () => {
      Object.keys(forceUpdateData).forEach(key => {
        forceUpdateData[key] = ''
      })
    }

    const onRejected = () => {
      showNotification.value = true
      notificationTitle.value = 'Error'
      notificationMessage.value = 'Please upload only CSV or Excel files'
    }

    const formatDate = (dateValue) => {
      return date.formatDate(dateValue, 'YYYY-MM-DD HH:mm')
    }

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'positive'
        case 'processing': return 'warning'
        case 'failed': return 'negative'
        default: return 'grey'
      }
    }

    const viewDetails = (row) => {
      // Implement view details logic
      console.log('Viewing details for:', row)
    }

    return {
      fileUpload,
      uploading,
      uploadProgress,
      formData,
      forceUpdateData,
      submitting,
      forceUpdating,
      infractionTypes,
      columns,
      recentUploads,
      loading,
      showNotification,
      notificationTitle,
      notificationMessage,
      uploadFile,
      onSubmit,
      onForceUpdate,
      resetForm,
      resetForceUpdate,
      onRejected,
      formatDate,
      getStatusColor,
      viewDetails
    }
  }
}
</script>
