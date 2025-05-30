<template>
  <q-toolbar class="bg-black text-white">
    <!-- Toolbar Title -->
    <q-toolbar-title>
      <q-icon name="dashboard" class="q-mr-sm" />
      Ticket Flow Dashboard
    </q-toolbar-title>
    <q-btn flat round icon="search" />
    <q-btn flat round icon="settings" class="q-ml-xs" />
    <!-- <q-btn flat round icon="notifications" class="q-ml-xs" /> -->
    <q-btn flat round icon="add_circle_outline" class="q-ml-xs" @click="enableAddTicket" />
  </q-toolbar>
  <!--/ Toolbar Title -->

  <div class="row q-pa-md q-col-gutter-md">
    <div class="col-3">
      <q-card flat class="bg-secondary text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="secondary" text-color="white" icon="group">New Tickets</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h3 q-pl-sm q-mt-sm">
            <b>12</b>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-3">
      <q-card flat class="bg-blue text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="blue" text-color="white" icon="verified">Closed Tickets</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h3 q-pl-sm q-mt-sm">
            <b>102</b>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-3">
      <q-card flat class="bg-green text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="green" text-color="white" icon="task_alt">Solved Tickets</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h3 q-pl-sm q-mt-sm">
            <b>98%</b>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-3">
      <q-card flat class="bg-red text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="red" text-color="white" icon="free_cancellation"
                >Tickets Overdue</q-chip
              >
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h3 q-pl-sm q-mt-sm">
            <b>3</b>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
  </div>

  <!-- Charts -->
  <div class="row q-pa-sm q-col-gutter-md">
    <div class="col-7">
      <div id="chart">
        <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
      </div>
    </div>
    <div class="col-5">
      <div id="chart">
        <apexchart
          type="line"
          height="350"
          :options="lineChartOptions"
          :series="lineSeries"
        ></apexchart>
      </div>
    </div>
  </div>
  <!--/ Charts -->

  <!-- Most Recent Tickkets -->
  <div class="q-pa-sm">
    <q-table flat :rows="rows" :columns="columns" row-key="name">
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-badge
            :color="
              props.row.priority === 'High'
                ? 'red'
                : props.row.priority === 'Medium'
                ? 'orange'
                : 'green'
            "
            text-color="white"
            class="q-pa-xs"
          >
            {{ props.row.priority }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-datecreated="props">
        <q-td :props="props">
          <q-badge color="blue" text-color="white" class="q-pa-xs">
            {{ props.row.datecreated }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-overdue="props">
        <q-td :props="props">
          <q-badge
            :color="new Date(props.row.overdue) < new Date() ? 'red' : 'green'"
            text-color="white"
            class="q-pa-xs"
          >
            {{ props.row.overdue }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn
            flat
            size="sm"
            round
            icon="arrow_forward"
            color="secondary"
            @click="edit(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <span></span>
    <q-btn flat no-caps class="view-all-tickets"> View All ... </q-btn>
  </div>
  <!--/ Most Recent Tickkets -->

  <!-- Add Ticket Dialog -->
  <q-dialog v-model="createTicketDialog" persistent>
    <q-card style="width: 80% !important">
      <q-card-section>
        <div class="text-h5">Create New Ticket</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="text-h6">Personal Details</p>
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6">
            <q-input v-model="newTicketName" label="Ticket Name" dense />
            <q-input
              v-model="newTicketDescription"
              label="Description"
              type="textarea"
              dense
              rows="3"
            />
          </div>
          <div class="col-6">
            <q-input v-model="newGroupName" label="Line Manager Email" dense />
            <q-input
              v-model="newGroupDescription"
              label="Description"
              type="textarea"
              dense
              rows="3"
            />
          </div>
        </div>

        <p class="text-h6">Common Requests Details</p>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select
              v-model="newTicketPriority"
              :options="priorityOptions"
              label="Priority"
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="newGroupParent"
              :options="flattenedGroups"
              option-label="name"
              option-value="_id"
              label="Parent Group (optional)"
              dense
              emit-value
              map-options
              @update:model-value="updateAvailablePermissions"
            />
            <q-select
              v-model="newGroupPermissions"
              :options="availablePermissions"
              label="User Permissions"
              multiple
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="newTicketPriority"
              :options="priorityOptions"
              label="Priority"
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="newGroupParent"
              :options="flattenedGroups"
              option-label="name"
              option-value="_id"
              label="Parent Group (optional)"
              dense
              emit-value
              map-options
              @update:model-value="updateAvailablePermissions"
            />
            <q-select
              v-model="newGroupPermissions"
              :options="availablePermissions"
              label="User Permissions"
              multiple
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Create" color="secondary" @click="createGroup" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!--/ Add Ticket Dialog -->
</template>
<script setup>
import { ref } from 'vue'
import ApexCharts from 'vue3-apexcharts'

const createTicketDialog = ref(false)

const enableAddTicket = () => {
  createTicketDialog.value = true
}

const series = ref([
  {
    name: 'New Tickets',
    data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
  },
  {
    name: 'Closed Tickets',
    data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
  },
  {
    name: 'Tickets Overdue',
    data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
  },
])
const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ['#008080', '#2196f3', '#f44336'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  title: {
    text: 'Tickets Flow by Month',
    align: 'left',
  },
  xaxis: {
    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + ' tickets'
      },
    },
  },
})

const lineSeries = ref([
  {
    name: 'Operations',
    data: [10, 41, 35, 51, 49, 32],
  },
  {
    name: 'Finance',
    data: [1, 4, 3, 5, 4, 2],
  },
])
const lineChartOptions = ref({
  chart: {
    height: 350,
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  //   colors: ['#FF5733', '#3375FF'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'straight',
  },
  title: {
    text: 'Tickets per Department',
    align: 'left',
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
})

const columns = [
  {
    name: 'ticketname',
    label: 'Ticket Name',
    required: true,
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'createdby',
    label: 'Created By',
    field: 'createdby',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'assignedto',
    label: 'Assigned To',
    field: 'assignedto',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'priority',
    label: 'Priority',
    field: 'priority',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'datecreated',
    label: 'Date Created',
    field: 'datecreated',
    align: 'right',
    sortable: true,
    format: (val) => new Date(val).toLocaleDateString('pt-PT'),
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'overdue',
    label: 'Date Overdue',
    field: 'overdue',
    align: 'right',
    format: (val) => new Date(val).toLocaleDateString('pt-PT'),
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },

  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
  },
]

const rows = ref([
  {
    name: 'Ticket #1234',
    createdby: 'John Doe',
    assignedto: 'Jane Smith',
    priority: 'High',
    datecreated: '2023-10-01',
    overdue: '2023-10-05',
  },
  {
    name: 'Ticket #5678',
    createdby: 'Alice Johnson',
    assignedto: 'Bob Brown',
    priority: 'Medium',
    datecreated: '27-05-2025',
    overdue: '30-05-2025',
  },
  {
    name: 'Ticket #9101',
    createdby: 'Charlie White',
    assignedto: 'Diana Green',
    priority: 'Low',
    datecreated: '27-05-2025',
    overdue: '30-05-2025',
  },
])
</script>

<script>
export default {
  components: {
    apexchart: ApexCharts,
  },
}
</script>

<style scoped>
.view-all-tickets {
  display: block;
  position: absolute;
  color: #ec101f;
  margin-top: 10px;
  font-style: italic;
  bottom: 1.6rem;
  margin-left: 0.4rem;
  font-weight: normal;
}

.q-dialog__inner--minimized > div {
  max-width: 80% !important;
}
</style>
