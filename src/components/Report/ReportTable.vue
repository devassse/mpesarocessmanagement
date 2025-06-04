<template>
  <!-- Report Table -->
  <q-table
    flat
    square
    :rows="rows"
    :columns="columns"
    row-key="id"
    bordered
    virtual-scroll
    :rows-per-page-options="[15, 25, 0]"
    class="sticky-header-table"
    :loading="!rows.length"
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
                :disable="props.col.disable && !isAdmin"
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
            :disable="!isAdmin"
          />
        </template>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSingleReportById, updateReport } from 'src/boot/reports'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import Cookies from 'js-cookie'

const $q = useQuasar()
const route = useRoute()
const reportName = ref('')
const reportMonth = ref('')

const columns = ref([])
const rows = ref([])

const isElectron = ref(false)
const isAdmin = ref(false)
const isEditor = ref(false)
const isViewer = ref(false)
const isAuditor = ref(false)


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
  isEditor.value = (await getCookie('isEditor')) === 'true'
  isViewer.value = (await getCookie('isViewer')) === 'true'
}


const emit = defineEmits(['reportNameToParent'])

const addNewRow = () => {
  const newRow = {}
  columns.value.forEach((col) => {
    newRow[col.name] = '---'
  })

  rows.value.push(newRow)
}

const removerLinha = (row, index) => {
  rows.value.splice(index, 1)
}

const saveUpdateReport = ({ name, month }) => {
  const id = route.params.id
  const report = {
    reportName: name, // Name passed from parent component
    reportMonth: month, // Month passed from parent component
    fileColumns: columns.value,
    fileRows: rows.value,
  }

  updateReport(id, report)
    .then((response) => {
      console.log('report updated', response)

      $q.notify({
        color: 'positive',
        message: `${response?.message}` || 'Report updated successfully!',
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

// Check if the columns have a "Date" column and disable it
// This must be updated only by Admin
const hasDateColumn = (columns) => {
  columns.some((c) => {
    const fieldName = c.field || c.name || ''
    fieldName.toLowerCase() === 'data' || fieldName.toLowerCase() === 'date'
    c.disable = true
  })
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
      columns.value = response.report.fileColumns || [];
      columns.value = (response.report.fileColumns || []).map((col) => ({
        align: 'left',
        ...col,
      }))

      // columns.value = (response.report.fileColumns || []).map((col) => {
      //   const fieldName = (col.field || col.name || '').toLowerCase()
      //   return {
      //     align: 'left',
      //     ...col,
      //     disable: fieldName === 'data' || fieldName === 'date',
      //   }
      // })

      // Emit the report name to the parent component
      const payload = {
        name: reportName.value,
        month: reportMonth.value,
      }
      emit('reportNameToParent', payload)

      hasDateColumn(columns.value)
    })
    .catch((error) => {
      console.error(error)
    })

  // Initialize cookie values
  await initializeCookieValues()
})

defineExpose({
  addNewRow,
  saveUpdateReport,
  exportToExcel,
})
</script>
<style lang="sass">
.q-table tbody td
  max-width: 500px !important;
  white-space: normal !important;

  .my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
