<template>
  <div class="bg-dark">
    <q-card class="bg-dark q-pt-lg" style="border: 0" flat>
      <div class="image-avatar-1 bg-secondary" style="border-radius: 100%">
        <img
          :src="images.business"
          class="appearBox"
          style="position: absolute; object-position: fit; height: 90%; width: 90%; right: 5px"
        />
      </div>

      <q-card-section class="text-center q-pt-sm text-white appearBox">
        <div class="text-h6">Reports</div>
      </q-card-section>
    </q-card>
  </div>
  <!-- The Table -->
  <q-table
    title="Reports"
    dense
    flat
    bordered
    square
    :rows="rows"
    :columns="columns"
    row-key="reportname"
    selection="single"
    :filter="filter"
    :loading="loading"
    :rows-per-page-options="[15]"
  >
    <template v-slot:top>
      <!-- <h4 class="q-ma-none q-pa-none">Reports</h4> -->
      <q-btn
        color="secondary"
        label="Create new Report"
        no-caps
        icon="add_chart"
        to="/reports/createreport"
      />
      <q-space />
      <q-input
        dense
        debounce="300"
        color="secondary"
        label="Search Reports"
        v-model="filter"
        style="width: 300px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-toggle
            color="secondary"
            v-model="props.expand"
            checked-icon="add"
            unchecked-icon="remove"
          />
        </q-td>

        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
          <div v-if="col.name === 'actions'">
            <q-btn
              flat
              round
              size="sm"
              icon="visibility"
              color="secondary"
              class="q-mr-xs"
              :to="{ name: 'ReportDetailsView', params: { id: props.row.id } }"
              v-if="!isAdmin"
            />
            <q-btn
              flat
              round
              size="sm"
              icon="edit"
              color="secondary"
              class="q-mr-xs"
              :to="{
                name: 'ReportMaintenanceView',
                params: { id: props.row.id },
              }"
              v-if="isAdmin"
            >
              <!-- <q-badge rounded color="red" floating>4</q-badge> -->
            </q-btn>
            <q-btn
              flat
              round
              size="sm"
              icon="delete"
              color="negative"
              @click="deleteReportTrigger(props.row)"
              :disable="!isAdmin"
            />
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <div class="text-left q-pl-md">
            <h6 class="q-my-none" style="font-size: 0.95rem">
              Roles management - <em>{{ props.row.reportname }}</em>
            </h6>
            <!-- This is expand slot for row above: {{ props.row.reportname }}. -->
            <div class="row" style="border-top: 1px solid #ccc">
              <div
                class="col-3"
                style="
                  display: flex;
                  flex-direction: column;
                  border-right: 1px solid #ccc;
                  padding-top: 5px;
                "
              >
                <span>Groups</span>
                <q-checkbox v-for="group in groups" v-model="selectedRoles" :key="group.name" :label="group.name" color="secondary"/>
              </div>
              <div
                class="col-6"
                style="
                  display: flex;
                  justify-content: space-between;
                  flex-direction: column;
                  padding-top: 5px;
                  padding-left: 10px;
                "
              >
                <span>Permissions</span>
                <q-checkbox v-model="value" label="Owner" color="secondary" />
                <q-checkbox v-model="value2" label="ReadOnly" color="secondary" />
                <q-checkbox v-model="value3" label="ParcialWritter" color="secondary" />
                <q-checkbox v-model="value" label="Owner" color="secondary" />
                <q-checkbox v-model="value2" label="ReadOnly" color="secondary" />
                <q-checkbox v-model="value3" label="ParcialWritter" color="secondary" />
              </div>
            </div>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!--/ The Table -->

  <!-- Confirm Delete Report Dialog -->
  <q-dialog v-model="isDeleteReport" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Confirm Delete Report</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p>
          Are you sure you want to delete the report
          <span class="delete-report-name">{{ reportName }}</span> ?
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="negative" v-close-popup />
        <q-btn flat label="Delete" color="secondary" @click="confirmDeleteReport" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!--/ Confirm Delete Report Dialog -->
</template>
<script setup>
import { onMounted, ref } from 'vue'
import images from 'src/boot/images'
import { getAllReports, deleteReport } from 'src/boot/reports'
import { getAllGroups } from 'boot/roles'
import Cookies from 'js-cookie'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const filter = ref('')

let value = ref(false)
let value2 = ref(false)
let value3 = ref(false)
let value4 = ref(false)
let value5 = ref(false)

const isElectron = ref(false)
const isAdmin = ref(false)
const isAuditor = ref(false)

const reportName = ref('')
const reportId = ref('')
const isDeleteReport = ref(false)

const groups = ref([])
const selectedRoles = ref([])

const communsRows = ref([])
const columns = [
  {
    name: 'reportname',
    align: 'left',
    label: 'Report Name',
    field: 'reportname',
    sortable: true,
  },
  {
    name: 'month',
    align: 'left',
    label: 'Month',
    field: 'month',
    sortable: true,
  },
  {
    name: 'owner',
    align: 'left',
    label: 'Dept. Owner',
    field: 'owner',
    sortable: true,
  },
  // { name: 'startdate', align: 'right', label: 'Start Date', field: 'startdate', sortable: true },
  // { name: 'duedate', align: 'right', label: 'Due Date', field: 'duedate', sortable: true },
  {
    name: 'createdat',
    align: 'right',
    label: 'Created At',
    field: 'createdat',
    sortable: true,
  },
  {
    name: 'lastmodified',
    align: 'right',
    label: 'Last Modified',
    field: 'lastmodified',
    sortable: true,
  },
  {
    name: 'actions',
    align: 'right',
    label: 'Actions',
    field: 'actions',
    align: 'right',
  },
]

const rows = ref([
  {
    id: 0,
    reportname: '',
    month: '',
    owner: '',
    createdat: '',
    lastmodified: '',
  },
])

const deleteReportTrigger = (row) => {
  console.log('Delete Report:', row)

  // Confirms the Name of the report to be deleted
  reportName.value = row?.reportname
  reportId.value = row?.id

  // Opens the delete confirmation dialog
  isDeleteReport.value = true
}

const confirmDeleteReport = () => {
  deleteReport(reportId.value)
    .then((response) => {
      console.log('Delete Report Response:', response)
      if (response) {
        $q.notify({
          color: 'positive',
          message: 'Report deleted successfully',
          icon: 'check_circle',
        })
        // Fetch all reports again to update the table
        fetchAllReports()
      } else {
        console.error('Failed to delete report')
        $q.notify({
          color: 'negative',
          message: 'Failed to delete Report. Please try again.',
          icon: 'error',
        })
        fetchAllReports()
      }
    })
    .catch((error) => {
      console.error('Error deleting report:', error)
    })

  isDeleteReport.value = false
  // Implement the delete logic here
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

const getCookie = async (name) => {
  if (isElectron.value) {
    return await window.electronAPI.getCookie(name)
  } else {
    return Cookies.get(name)
  }
}

const initializeCookieValues = async () => {
  isAdmin.value = (await getCookie('isAdmin')) === 'true'
  isAuditor.value = (await getCookie('isAuditor')) === 'true'
}

const fetchAllReports = () => {
  getAllReports()
    .then((response) => {
      communsRows.value = response.reports
      rows.value = communsRows.value.map((row) => {
        return {
          id: row._id,
          reportname: row.reportName || ' --- ',
          month: row.reportMonth.toString() || ' --- ',
          owner: row.reportDepartment.toString() || ' --- ',
          createdat: formatDate(row.createdAt) || ' --- ',
          lastmodified: formatDate(row.updatedAt) || ' --- ',
        }
      })
    })
    .catch((error) => {
      console.error(error)
    })
}

const fetchAllGroups = async () => {
  groups.value = await getAllGroups()
}

onMounted(async () => {
  await initializeCookieValues()
  fetchAllReports()
  await fetchAllGroups()
})
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

.q-badge--floating {
  position: absolute;
  top: -8px;
  right: -6px;
  cursor: inherit;
}

.delete-report-name {
  font-weight: bold;
  font-style: italic;
  color: $negative;
}


</style>
