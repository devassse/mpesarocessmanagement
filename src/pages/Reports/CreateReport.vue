<template>
  <q-toolbar class="bg-black text-white">
    <q-toolbar-title>
      {{ reportname || '-------' }}
    </q-toolbar-title>
    <q-btn flat round dense icon="table_chart" class="q-mr-xs" @click="showDialog = true">
      <q-tooltip> Add New Column </q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      dense
      icon="table_rows"
      class="q-mr-xs"
      @click="addNewRow"
      :disable="importedFileColumns.length == 0"
    >
      <q-tooltip> Add New Row </q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      dense
      icon="save"
      class="q-mr-xs"
      @click="saveReport"
      :disable="importedFileColumns.length == 0"
    >
      <q-tooltip> Save </q-tooltip>
    </q-btn>
    <q-btn flat round dense to="/reports" icon="arrow_back">
      <q-tooltip> Go back </q-tooltip>
    </q-btn>
  </q-toolbar>

  <div class="q-pa-md">
    <div class="row q-col-gutter-md q-pb-md q-px-sm">
      <div class="col-3">
        <q-input dense clearable v-model="reportname" label="Report Name">
          <template v-slot:prepend>
            <q-icon name="article" @click.stop.prevent />
          </template>
        </q-input>
      </div>
      <div class="col-3">
        <q-select
          dense
          clearable
          v-model="reportmonth"
          use-input
          multiple
          input-debounce="0"
          emit-value
          label="Select Report Month"
          :options="monthOptions"
          option-label="label"
          option-value="value"
          @filter="filterFn"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
          <template v-slot:prepend>
            <q-icon name="calendar_month" @click.stop.prevent />
          </template>
        </q-select>
      </div>

      <div class="col-3">
        <q-select
          dense
          clearable
          v-model="reportdepartment"
          use-input
          multiple
          input-debounce="0"
          emit-value
          label="Select Report Owner Department"
          :options="departmenthOptions"
          option-label="label"
          option-value="value"
          @filter="filterDeptFn"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
          <template v-slot:prepend>
            <q-icon name="account_tree" @click.stop.prevent />
          </template>
        </q-select>
      </div>

      <!-- Upload Excel File -->
      <div class="col-3">
        <q-file
          dense
          v-model="existingfile"
          clearable
          accept=".csv, .xlsx, .xls"
          label="Upload Existing .xlx(s)"
          @update:model-value="handleFileUpload"
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" @click.stop.prevent />
          </template>
        </q-file>
      </div>
      <!--/ Upload Excel File -->
    </div>

    <!-- Report Table -->
    <q-table
      flat
      bordered
      square
      :rows="importedFileRows"
      :columns="importedFileColumns"
      row-key="id"
      class="sticky-header-table"
      :rows-per-page-options="[9]"
    >
      <!-- Enables Edit Table Headers -->
      <template #header="props">
        <q-tr :props="props">
          <q-th
            v-for="(col, index) in props.cols"
            :key="col?.name"
            style="text-align: left"
            draggable
            @dragstart="onDragStart($event, index)"
            @dragover.prevent
            @drop="onDrop($event, index)"
          >
            <div class="row items-center no-wrap">
              <span>{{ capitalize(col?.label) }}</span>

              <!-- Popup edit -->
              <q-popup-edit
                :model-value="col?.label"
                v-slot="scope"
                @save="(val) => updateColumnLabel(col, val)"
              >
                <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
              </q-popup-edit>

              <!-- Delete Column Button -->
              <q-btn
                v-if="col?.name !== 'actions'"
                dense
                flat
                round
                icon="close"
                size="xs"
                class="q-ml-xs"
                style="color: red; margin-top: -10px"
                @click.stop="deleteColumn(col.name)"
              >
                <q-tooltip>Delete Column - {{ col?.name }}</q-tooltip>
              </q-btn>
            </div>
          </q-th>
        </q-tr>
      </template>
      <!--/ Enables Edit Table Headers -->

      <!-- Slot para coluna custom -->
      <template v-if="customColumn.name" v-slot:[`body-cell-${customColumn.name}`]="props">
        <q-td :props="props">
          <q-badge color="teal" :label="props.row[customColumn.name]" />
        </q-td>
      </template>

      <template
        v-for="col in dynamicColumns"
        :key="col.name"
        v-slot:[`body-cell-${col.name}`]="props"
      >
        <q-td :props="props">
          <!-- Validade CHIP according to Status -->
          <div v-if="col.name === 'status'">
            <q-chip v-if="props.row[col.field] === 'Open'" color="green" text-color="white" dense>
              {{ props.row[col.field] }}
            </q-chip>
            <q-chip
              v-else-if="props.row[col.field] === 'Closed'"
              color="orange"
              text-color="white"
              dense
            >
              {{ props.row[col.field] }}
            </q-chip>
            <q-chip v-else-if="props.row[col.field] === 'Overdue'" color="red" text-color="white" dense>
              {{ props.row[col.field] }}
            </q-chip>
            <span v-else>
              {{ props.row[col.field] }}
            </span>
            <q-popup-edit v-model="props.row[col.field]" auto-save v-slot="scope">
              <q-select
                v-model="scope.value"
                :options="statusOptions"
                dense
                emit-value
                map-options
                @keyup.enter="scope.set"
              />
            </q-popup-edit>
          </div>
          <!-- Senão, exibe o render cell habitual + popup edit -->
          <div v-else>
            {{ renderCell(col.name, props.row[col.field], props.row) || '---' }}
            <q-popup-edit v-model="props.row[col.field]" auto-save v-slot="scope">
              <q-input
                type="textarea"
                rows="3"
                v-model="scope.value"
                dense
                autofocus
                @keyup.enter="scope.set"
              />
            </q-popup-edit>
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td align="right" style="width: 30px">
          <q-btn
            size="sm"
            flat
            round
            color="negative"
            icon="delete"
            @click="deleteRow(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <!--/ Report Table -->
  </div>

  <!-- Add Column Dialog -->
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Column Title</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="customColumn.label" label="Column Title" outlined dense autofocus />
        <q-input
          v-model="customColumn.defaultValue"
          label="Default Value"
          outlined
          dense
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" color="negative" v-close-popup />
        <q-btn
          label="Add"
          color="secondary"
          @click="addCustomColumn"
          @keyup.enter="addCustomColumn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { ref, computed } from 'vue'
import { createReport } from 'src/boot/reports'

const $q = useQuasar()
let idCounter = 1
let reportname = ref('')
let reportmonth = ref([])
let reportdepartment = ref(null)
let existingfile = ref(null)

const excelData = ref([])
const importedFileRows = ref([])
const importedFileColumns = ref([])

const showDialog = ref(false)

const customColumn = ref({
  label: '',
  defaultValue: '',
  name: '',
})

// Add Costum Column
const addCustomColumn = () => {
  const label = customColumn.value.label?.trim()
  const defaultVal = customColumn.value.defaultValue
  if (!label) return

  const colName = label.toLowerCase().replace(/\s+/g, '_')
  customColumn.value.name = colName

  const alreadyExists = importedFileColumns.value.some((col) => col.name === colName)

  if (alreadyExists) {
    $q.notify({
      type: 'warning',
      message: `A coluna "${label}" já existe.`,
      icon: 'warning',
    })
    return
  }

  // Add New Column
  importedFileColumns.value.splice(importedFileColumns.value.length - 1, 0, {
    name: colName,
    label: label,
    field: colName,
    align: 'left',
  })

  importedFileRows.value.forEach((row) => {
    row[colName] = defaultVal
  })

  showDialog.value = false
  customColumn.value = { label: '', defaultValue: '', name: '' }
}

const deleteColumn = (columnName) => {
  importedFileColumns.value = importedFileColumns.value.filter((col) => col.name !== columnName)

  importedFileRows.value = importedFileRows.value.map((row) => {
    const newRow = { ...row }
    delete newRow[columnName]
    return newRow
  })
}

const deptSelectOptions = [
  { label: 'Compliance', value: 'Compliance' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Support', value: 'Support' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Customer Service', value: 'Customer Service' },
  { label: 'Human Resources', value: 'Human Resources' },
  { label: 'IT', value: 'IT' },
  { label: 'Core & Digital', value: 'Core & Digital' },
  { label: 'Risk', value: 'Risk' },
  { label: 'Business & Payments', value: 'Business & Payments' },
  { label: 'Financial Services', value: 'Financial Services' },
]

const monthSelectOptions = [
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

const statusOptions = [
  { label: 'Open', value: 'Open' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Overdue', value: 'Overdue' },
]
const monthOptions = ref(monthSelectOptions)
const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      monthOptions.value = monthSelectOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    monthOptions.value = monthSelectOptions.filter((v) =>
      String(v.label || '')
        .toLowerCase()
        .includes(needle)
    )
  })
}

const departmenthOptions = ref(deptSelectOptions)
const filterDeptFn = (val, update) => {
  if (val === '') {
    update(() => {
      departmenthOptions.value = deptSelectOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    departmenthOptions.value = deptSelectOptions.filter((v) =>
      String(v.label || '')
        .toLowerCase()
        .includes(needle)
    )
  })
}

// Upload Excel File and convert to JSON and build Table
const handleFileUpload = (file) => {
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })

    // Read first Sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    excelData.value = json

    // Check for empty columns and handle them
    const checkEmptyColumns = (columns, rows) => {
      const emptyColumns = []

      // Iterate over each column to check if all cells are empty
      columns.forEach((col, index) => {
        const isEmpty = rows.every((row) => !row[index] || row[index] === '')
        if (isEmpty) {
          emptyColumns.push(col.name)
        }
      })

      // If any empty columns exist, notify or handle
      if (emptyColumns.length > 0) {
        $q.notify({
          type: 'warning',
          message: `This columns are empty (${emptyColumns.join(', ')})`,
          icon: 'warning',
        })
      }
    }

    // Building Table Headers
    importedFileColumns.value = json[0].map((col, index) => ({
      id: idCounter++,
      name: String(col).toLowerCase(), // OLD Approach col?.toLowerCase(),
      label: capitalize(col),
      field: String(col).toLowerCase(),
      align: 'left' || '',
      user_ids: [],
    }))

    // Check if the 'status' column already exists
    // If the 'status' column does not exist, add it
    if (!importedFileColumns.value.find((col) => col.name === 'status')) {
      importedFileColumns.value.push({
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'right',
      })
    }

    // Add a static column at the end
    importedFileColumns.value.push({
      name: 'actions',
      label: 'Actions',
      field: 'actions',
      align: 'right',
    })

    // Check for empty columns and notify
    checkEmptyColumns(importedFileColumns.value, json.slice(1))

    // Building Table Rows
    importedFileRows.value = excelData.value.slice(1).map((row, index) => {
      const rowData = {}
      importedFileColumns.value.forEach((col, colIndex) => {
        // If the value is empty, fill it with an empty string with dashes(" --- ")
        rowData[col.field] = row[colIndex] || ' --- ' // Replace empty cells with an empty string

        // If the column is 'status', set a default value of 'Open'
        if (col.name === 'status') {
          rowData[col.field] = rowData[col.field] || 'Open'
        }
      })
      return { id: index + 1, ...rowData }
    })
  }
  reader.readAsArrayBuffer(file)
}

const dynamicColumns = computed(() =>
  importedFileColumns.value.filter((col) => col.name !== 'actions')
)

//On this method, I can trick the table to render the cell as I want
// @params columnName: string - The name of the column
// @params value: string - The value of the cell
// @params row: object - The row object
const renderCell = (columnName, value, row) => {
  // Default
  return value
}

const updateColumnLabel = (col, newLabel) => {
  col.label = newLabel

  const index = importedFileColumns.value.findIndex((c) => c?.name === col?.name)
  if (index !== -1) {
    importedFileColumns.value[index] = {
      ...importedFileColumns.value[index],
      label: newLabel,
    }
  }
}

const addNewRow = () => {
  // Building Table Headers
  importedFileRows.value.push({
    id: idCounter++,
    name: `col${importedFileColumns.value.length}`,
    label: `col${importedFileColumns.value.length}`,
    field: `col${importedFileColumns.value.length}`,
    align: 'left',
  })
}

const deleteRow = (row) => {
  importedFileRows.value = importedFileRows.value.filter((r) => r.id !== row.id)
}

const saveReport = async () => {
  const response = ref(null)
  try {
    response.value = await createReport({
      reportname: reportname.value,
      reportmonth: reportmonth.value,
      reportdepartment: reportdepartment.value,
      importedFileColumns: importedFileColumns.value,
      importedFileRows: importedFileRows.value,
    })

    $q.notify({
      color: 'positive',
      message: 'Report created successfully',
      icon: 'check_circle',
    })

    // Redirecionar após sucesso
    window.location.href = '#/reports'
  } catch (error) {
    console.error('Error creating report:', response)
    $q.notify({
      color: 'negative',
      message: response.value || 'Failed to create Report. Please try again.',
      icon: 'error',
    })
  }
}

//Utility function to capitalize the first letter of a string
const capitalize = (str) => str && str[0].toUpperCase() + str.slice(1).toLowerCase()
</script>

<style lang="sass" scoped>
.sticky-header-table
  .q-table__top,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #008080
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
