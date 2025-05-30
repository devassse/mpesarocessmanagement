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
    <q-btn flat round dense icon="file_download" @click="exportToExcelOnChild">
      <q-tooltip> Export File </q-tooltip>
    </q-btn>
    <!-- <q-btn flat round dense icon="person">
      <q-badge floating color="red">2</q-badge>
      <q-tooltip> 2 new modifications </q-tooltip>
    </q-btn> -->
    <q-btn flat round dense icon="table_rows" class="q-mr-xs" @click="addNewRowOnChild">
      <q-tooltip> Add New Row </q-tooltip>
    </q-btn>
    <q-btn flat round dense icon="save" class="q-mr-xs" @click="saveUpdateReportOnChild">
      <q-tooltip> Update Report </q-tooltip>
    </q-btn>
    <q-btn flat round dense to="/reports" icon="arrow_back">
      <q-tooltip> Go back </q-tooltip>
    </q-btn>
  </q-toolbar>

  <!-- Report Table -->
  <div class="q-pa-none">
    <q-card flat>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="secondary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="tables" label="Table" />
        <q-tab name="summary" label="Summary" />
        <q-tab name="graphs" label="Graphics" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="tables">
          <report-table ref="reportTableRef"/>
        </q-tab-panel>

        <q-tab-panel name="summary">
          <div class="text-h6">Summary</div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </q-tab-panel>

        <q-tab-panel name="graphs">
          <report-graphs />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReportGraphs from 'src/components/Report/ReportGraphs.vue'
import ReportTable from 'src/components/Report/ReportTable.vue'

const reportName = ref('')
const reportMonth = ref('')
const tab = ref('tables')
const reportTableRef = ref(null)

const addNewRowOnChild = () => {s
  reportTableRef.value?.addNewRow()
}

const saveUpdateReportOnChild = () => {
  reportTableRef.value?.saveUpdateReport()
}

const exportToExcelOnChild = () => {
  reportTableRef.value?.exportToExcel()
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
</script>