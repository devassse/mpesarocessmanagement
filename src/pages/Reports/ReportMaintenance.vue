<template>
  <q-toolbar class="bg-black text-white">
    <q-toolbar-title>
      <span>
        {{ reportName || 'Report Name' }}
        <q-popup-edit v-model="reportName" auto-save v-slot="scope">
          <q-input
            type="textarea"
            rows="3"
            v-model="scope.value"
            dense
            autofocus
            @keyup.enter="scope.set"
          />
        </q-popup-edit>
      </span>
      <em
        >({{ reportMonth.toString() || ' --- ' }})
        <q-popup-edit v-model="reportMonth" auto-save v-slot="scope">
          <!-- <q-input type="textarea" rows="3" v-model="scope.value" dense autofocus @keyup.enter="scope.set" /> -->
          <q-select
            option-label="label"
            option-value="value"
            v-model="scope.value"
            :options="monthOptions"
            @keyup.enter="scope.set"
            multiple
            input-debounce="0"
            emit-value
          />
        </q-popup-edit>
      </em>
    </q-toolbar-title>
    <q-btn flat round dense icon="file_download" @click="exportToExcel(rows)">
      <q-tooltip> Export File </q-tooltip>
    </q-btn>
    <!-- <q-btn flat round dense icon="person">
      <q-badge floating color="red">2</q-badge>
      <q-tooltip> 2 new modifications </q-tooltip>
    </q-btn> -->
    <q-btn flat round dense icon="table_rows" class="q-mr-xs" @click="addNewRow">
      <q-tooltip> Add New Row </q-tooltip>
    </q-btn>
    <q-btn flat round dense icon="save" class="q-mr-xs" @click="saveUpdateReport">
      <q-tooltip> Update Report </q-tooltip>
    </q-btn>
    <q-btn flat round dense to="/reports" icon="arrow_back">
      <q-tooltip> Go back </q-tooltip>
    </q-btn>
  </q-toolbar>

  <div class="row q-pa-md q-col-gutter-md">
    <div class="col-4">
      <q-card flat class="text-white" style="background-color: #ff1100">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip text-color="white" icon="warning" style="background-color: #ff1100"
                >Potential Risks</q-chip
              >
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat dense round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>470</b>
            <q-chip
              size="sm"
              icon="arrow_drop_up"
              color="green"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              3.2%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4">
      <q-card flat class="bg-green text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="green" text-color="white" icon="group">New Customers</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>9038</b>
            <q-chip
              size="sm"
              icon="arrow_drop_down"
              color="red"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              1.4%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4">
      <q-card flat class="bg-blue text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="blue" text-color="white" icon="phishing">Fraude monitoring</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat dense round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>38</b>
            <q-chip
              size="sm"
              icon="arrow_left"
              color="orange"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              0.3%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
  </div>

  <!-- Report Table -->
  <div class="q-pa-md">
    <q-table
      flat
      square
      :rows="rows"
      :columns="columns"
      row-key="id"
      bordered
      virtual-scroll
      :rows-per-page-options="[15]"
      class="sticky-header-table"
    >
      <!-- Generic Slot for All Cells with Q-EDIT-POPUP -->
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <template v-if="props.col.name !== 'actions'">
            {{ formatDisplay(props.value, getFieldType(props.col.name)) }}
            <q-popup-edit v-model="props.row[props.col.name]" auto-save v-slot="scope">
              <template v-if="getFieldType(props.col.name) === 'date'">
                <q-date
                  v-model="scope.value"
                  mask="DD/MM/YYYY"
                  @keyup.enter="scope.set"
                  flat
                  minimal
                />
              </template>

              <template v-else>
                <q-input
                  :type="getFieldType(props.col.name) === 'number' ? 'number' : 'textarea'"
                  rows="3"
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </template>
            </q-popup-edit>
          </template>
          <!-- <template v-if="props.col.name !== 'actions'">
            {{ props.value }}
            <q-popup-edit
              v-model="props.row[props.col.name]"
              auto-save
              v-slot="scope"
            >
              <q-input
                type="textarea"
                rows="3"
                v-model="scope.value"
                dense
                autofocus
                @keyup.enter="scope.set"
              />
            </q-popup-edit>
          </template> -->

          <!-- Actions Column -->
          <template v-else>
            <q-btn
              size="sm"
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removerLinha(props.row, props.rowIndex)"
            />
          </template>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSingleReportById, updateReport } from 'src/boot/reports'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const route = useRoute()
const reportName = ref('')
const reportMonth = ref('')

const columns = ref([])
const rows = ref([])

let idCounter = 1
let progress = ref(16)

const optionsStatus = ['Done', 'In Progress', 'To Do', 'Closed']

const addNewRow = () => {
  const newRow = {}
  columns.value.forEach((col) => {
    newRow[col.name] = '---'
  })

  rows.value.push(newRow)
}

const removerLinha = (row, index) => {
  // console.log("Row to remove", row);
  // console.log("Row to remove", index);

  rows.value.splice(index, 1)
}

const saveUpdateReport = () => {
  const id = route.params.id
  const report = {
    reportName: reportName.value,
    reportMonth: reportMonth.value,
    fileColumns: columns.value,
    fileRows: rows.value,
  }

  updateReport(id, report)
    .then((response) => {
      $q.notify({
        color: 'positive',
        message: 'Report updated successfully',
        icon: 'check_circle',
      })
    })
    .catch((error) => {
      $q.notify({
        color: 'negative',
        message: 'Failed to update Report. Please try again.',
        icon: 'error',
      })
      console.error(error)
    })
}

const monthOptions = [
  {
    label: 'January',
    value: 'January',
  },
  {
    label: 'February',
    value: 'February',
  },
  {
    label: 'March',
    value: 'March',
  },
  {
    label: 'April',
    value: 'April',
  },
  {
    label: 'May',
    value: 'May',
  },
  {
    label: 'June',
    value: 'June',
  },
  {
    label: 'July',
    value: 'July',
  },
  {
    label: 'August',
    value: 'August',
  },
  {
    label: 'September',
    value: 'September',
  },
  {
    label: 'October',
    value: 'October',
  },
  {
    label: 'November',
    value: 'November',
  },
  {
    label: 'December',
    value: 'December',
  },
]

// Utilities Methods
const getFieldType = (colName) => {
  // const name = colName.toLowerCase()
  const name = typeof colName === 'string' ? colName.toLowerCase() : ''

  if (name.includes('date') || name.includes('data')) {
    return 'date'
  }

  if (
    name.includes('amount') ||
    name.includes('total') ||
    name.includes('salary') ||
    name.includes('valor') ||
    name.includes('preco') ||
    name.includes('price')
  ) {
    return 'number'
  }

  return 'text'
}

const parseAnyDate = (value) => {
  if (typeof value !== 'string') return new Date(value)

  // Normaliza separadores ("/" → "-")
  const val = value.trim().replace(/\//g, '-')

  // YYYY-MM-DD → ex: 1988-08-30
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return isValidDate(date) ? date : null
  }

  // DD-MM-YYYY → ex: 30-08-1988
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return isValidDate(date) ? date : null
  }

  // Última tentativa: deixar o Date parser fazer o trabalho
  const fallback = new Date(val)
  return isValidDate(fallback) ? fallback : null
}

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime())

const formatDisplay = (value, type) => {
  if (type === 'date') {
    const d = parseAnyDate(value)
    return d
      ? new Intl.DateTimeFormat('pt-PT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(d)
      : value
  }

  if (type === 'number') {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(value))
  }

  return value
}

// Export to Excel
const exportToExcel = () => {
  const plainRows = rows.value.map((row) => ({ ...row }))
  const worksheet = XLSX.utils.json_to_sheet(plainRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')
  XLSX.writeFile(workbook, 'report.xlsx')
}

onMounted(async () => {
  const id = route.params.id
  getSingleReportById(id)
    .then((response) => {
      //Atribute the response to the variables
      reportName.value = response.report.reportName || ''
      reportMonth.value = response.report.reportMonth || ''

      //Columns and Rows
      rows.value = response.report.fileRows || []
      // columns.value = response.report.fileColumns || [];
      columns.value = (response.report.fileColumns || []).map((col) => ({
        align: 'left',
        ...col,
      }))
    })
    .catch((error) => {
      console.error(error)
    })
})
</script>
<style lang="sass">
.q-table tbody td
  max-width: 500px !important;
  white-space: normal !important;

.sticky-header-table
  .q-table__top,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #008081
    color: #ffffff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 30px
  thead tr:first-child th
    top: 0

  q-table thead tr,
  .q-table tbody td
    height: 30px;
</style>
