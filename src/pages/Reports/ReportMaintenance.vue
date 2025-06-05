<template>
  <q-header elevated>
    <q-toolbar class="bg-black text-white">
      <q-toolbar-title>
        <span>
          {{ reportNameChild || 'Report Name' }}
          <q-popup-edit v-model="reportNameChild" auto-save v-slot="scope" v-if="isAdmin">
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
          >({{ reportMonthChild.toString() || ' --- ' }})
          <q-popup-edit v-model="reportMonthChild" auto-save v-slot="scope" v-if="isAdmin">
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
      <q-btn v-if="isAdmin" flat round dense icon="person">
        <q-badge floating color="red">2</q-badge>
        <q-tooltip> 2 new modifications </q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="table_rows"
        class="q-mr-xs"
        @click="addNewRowOnChild"
        :disable="!isAdmin"
      >
        <q-tooltip> Add New Row </q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="save"
        class="q-mr-xs"
        @click="saveUpdateReportOnChild"
        :disable="!isAdmin"
      >
        <q-tooltip> Update Report </q-tooltip>
      </q-btn>
      <q-btn flat round dense to="/reports" icon="arrow_back">
        <q-tooltip> Go back </q-tooltip>
      </q-btn>
    </q-toolbar>
  </q-header>

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
        no-caps
      >
        <q-tab name="tables" label="Table" />
        <q-tab name="summary" label="Summary" />
        <q-tab name="graphs" label="Graphics" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="q-pa-sm" name="tables">
          <report-table
            v-if="isAdmin || isEditor"
            @report-name-to-parent="reportNameFromChild"
            ref="reportTableRef"
          />
          <report-view v-else @report-name-to-parent="reportNameFromChild" />
        </q-tab-panel>

        <q-tab-panel name="summary">
          <report-summary />
        </q-tab-panel>

        <q-tab-panel name="graphs" class="q-pa-sm" >
          <report-graphs />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import ReportTable from 'src/components/Report/ReportTable.vue'
import ReportView from 'src/components/Report/ReportView.vue'
import ReportSummary from 'src/components/Report/ReportSummary.vue'
import ReportGraphs from 'src/components/Report/ReportGraphs.vue'
import Cookies from 'js-cookie'

const isElectron = ref(false)
const isAdmin = ref(false)
const isEditor = ref(false)
const isViewer = ref(false)
const isAuditor = ref(false)
const tab = ref('tables')
const reportTableRef = ref(null)

const reportNameChild = ref('')
const reportMonthChild = ref('')

const reportNameFromChild = (payload) => {
  reportNameChild.value = payload.name
  reportMonthChild.value = payload.month
}

const addNewRowOnChild = () => {
  reportTableRef.value?.addNewRow()
}

const saveUpdateReportOnChild = () => {
  const payload = {
    name: reportNameChild.value,
    month: reportMonthChild.value,
  }
  reportTableRef.value?.saveUpdateReport(payload)
}

const exportToExcelOnChild = () => {
  reportTableRef.value?.exportToExcel()
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
  isEditor.value = (await getCookie('isEditor')) === 'true'
  isViewer.value = (await getCookie('isViewer')) === 'true'
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

onMounted(async () => {
  initializeCookieValues()
})
</script>
