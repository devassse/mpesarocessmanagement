<template>
  <div class="q-pa-md">
    <q-table
      flat
      title="Agent Clawback Records"
      :rows="rows"
      :columns="columns"
      row-key="shortCode"
      :filter="filter"
      :rows-per-page="[10]"
    >
    <template v-slot:top>

      <q-space />
      <q-input borderless dense debounce="300" color="primary" v-model="filter">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="{ 'bg-red-50': props.row.infractionCount > 3 }"
          @click="showHistory(props.row)"
          class="cursor-pointer"
        >
          <q-td key="shortCode" :props="props">
            {{ props.row.shortCode }}
          </q-td>
          <q-td key="orgName" :props="props">
            {{ props.row.orgName }}
          </q-td>
          <q-td key="infractionCount" :props="props">
            <q-badge :color="props.row.infractionCount > 3 ? 'negative' : 'warning'">
              {{ props.row.infractionCount }}
            </q-badge>
          </q-td>
          <q-td key="lastInfraction" :props="props">
            {{ props.row.lastInfraction }}
          </q-td>
          <q-td key="clawbackAmount" :props="props">
            <q-badge color="primary">
              {{ props.row.clawbackAmount }}
            </q-badge>
          </q-td>
          <q-td key="accountStatus" :props="props">
            <q-badge :color="getStatusColor(props.row.accountStatus)">
              {{ props.row.accountStatus }}
            </q-badge>
          </q-td>
          <q-td key="parentOrg" :props="props">
            {{ props.row.parentOrg }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- History Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Infraction History</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            {{ selectedOrg?.orgName }} ({{ selectedOrg?.shortCode }})
          </div>

          <!-- Timeline of infractions -->
          <q-timeline color="secondary">
            <q-timeline-entry
              v-for="infraction in selectedOrg?.infractionHistory"
              :key="infraction.date"
              :title="infraction.type"
              :subtitle="infraction.date"
            >
              <div>
                <span v-if="infraction.type == 'Behavioral deviation'">Nr. of Transactions: 109</span>
                 <!-- {{ infractionHistory }} -->
                <span v-else >Amount: {{ infraction.amount }}</span>
                <q-badge
                  :color="getStatusColor(infraction.status)"
                  class="q-ml-sm"
                >
                  {{ infraction.status }}
                </q-badge>
              </div>
              <div class="text-caption q-mt-sm">
                {{ infraction.description }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

        <q-card-section class="bg-grey-1">
          <div class="text-subtitle2">Summary</div>
          <div class="q-mt-sm" v-if="selectedOrg">
            <div>Total Infractions: {{ selectedOrg.infractionCount }}</div>
            <div>Total Amount: {{ selectedOrg.clawbackAmount }}</div>
            <div>Current Status:
              <q-badge :color="getStatusColor(selectedOrg.accountStatus)">
                {{ selectedOrg.accountStatus }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'

const columns = [
  {
    name: 'shortCode',
    required: true,
    label: 'Agent Short Code',
    align: 'left',
    field: 'shortCode',
    sortable: true
  },
  {
    name: 'orgName',
    label: 'Agent Name',
    field: 'orgName',
    sortable: true
  },
  {
    name: 'infractionCount',
    label: 'Infractions',
    field: 'infractionCount',
    sortable: true
  },
  {
    name: 'lastInfraction',
    label: 'Last Infraction Date',
    field: 'lastInfraction',
    sortable: true
  },
  {
    name: 'clawbackAmount',
    label: 'Clawback Amount',
    field: 'clawbackAmount',
    sortable: true
  },
  {
    name: 'accountStatus',
    label: 'Status',
    field: 'accountStatus',
    sortable: true
  },
  {
    name: 'parentOrg',
    label: 'Parent Organization',
    field: 'parentOrg',
    sortable: true
  }
]

// Extended rows with infraction history
const rows = [
  {
    shortCode: 'AG001',
    orgName: 'Banca Cristóvão',
    infractionCount: 2,
    lastInfraction: '2024-03-15',
    clawbackAmount: 5000,
    accountStatus: 'Frozen',
    parentOrg: 'Parent Corp A',
    infractionHistory: [
      {
        date: '2024-03-15',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Active',
        description: 'Multiple unauthorized transactions detected'
      },
      {
        date: '2024-02-10',
        type: 'Policy Violation',
        amount: 2000,
        status: 'Resolved',
        description: 'Failed to follow KYC procedures'
      }
    ]
  },
  {
    shortCode: 'AG002',
    orgName: 'Mercearia Subverso',
    infractionCount: 4,
    lastInfraction: '2024-03-10',
    clawbackAmount: 15000,
    accountStatus: 'Terminated',
    parentOrg: 'Parent Corp B',
    infractionHistory: [
      {
        date: '2024-03-10',
        type: 'Fraud',
        amount: 5000,
        status: 'Active',
        description: 'Systematic fraudulent activities detected'
      },
      {
        date: '2024-02-15',
        type: 'Policy Violation',
        amount: 4000,
        status: 'Resolved',
        description: 'Action that breaches company rules or guidelines'
      },
      {
        date: '2024-01-20',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Resolved',
        description: 'Unauthorized Agent activities detected on system'
      },
      {
        date: '2024-01-05',
        type: 'Behavioral deviation',
        amount: 3000,
        status: 'Resolved',
        description: 'Multiple low-value agent transactions to same client'
      }
    ]
  },
  {
    shortCode: 'AG10223',
    orgName: 'Yiman Comercial',
    infractionCount: 0,
    lastInfraction: '2024-03-10',
    clawbackAmount: 0,
    accountStatus: 'Suspecious',
    parentOrg: 'Parent Corp B',
    infractionHistory: [
      {
        date: '2024-03-10',
        type: 'Fraud',
        amount: 5000,
        status: 'Active',
        description: 'Systematic fraudulent activities detected'
      },
      {
        date: '2024-02-15',
        type: 'Security Breach',
        amount: 4000,
        status: 'Resolved',
        description: 'Unauthorized access to customer accounts'
      },
      {
        date: '2024-01-20',
        type: 'Policy Violation',
        amount: 3000,
        status: 'Resolved',
        description: 'Multiple compliance violations'
      },
      {
        date: '2024-01-05',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Resolved',
        description: 'Processing transactions outside approved hours'
      }
    ]
  },
  {
    shortCode: 'AG10223',
    orgName: 'Labele Nguila 01',
    infractionCount: 0,
    lastInfraction: '2024-03-10',
    clawbackAmount: 0,
    accountStatus: 'Suspecious',
    parentOrg: 'Parent Corp B',
    infractionHistory: [
      {
        date: '2024-03-10',
        type: 'Fraud',
        amount: 5000,
        status: 'Active',
        description: 'Systematic fraudulent activities detected'
      },
      {
        date: '2024-02-15',
        type: 'Security Breach',
        amount: 4000,
        status: 'Resolved',
        description: 'Unauthorized access to customer accounts'
      },
      {
        date: '2024-01-20',
        type: 'Policy Violation',
        amount: 3000,
        status: 'Resolved',
        description: 'Multiple compliance violations'
      },
      {
        date: '2024-01-05',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Resolved',
        description: 'Processing transactions outside approved hours'
      }
    ]
  },
  {
    shortCode: 'AG002',
    orgName: 'Agencia 2',
    infractionCount: 4,
    lastInfraction: '2024-03-10',
    clawbackAmount: 15000,
    accountStatus: 'Terminated',
    parentOrg: 'Parent Corp B',
    infractionHistory: [
      {
        date: '2024-03-10',
        type: 'Fraud',
        amount: 5000,
        status: 'Active',
        description: 'Systematic fraudulent activities detected'
      },
      {
        date: '2024-02-15',
        type: 'Security Breach',
        amount: 4000,
        status: 'Resolved',
        description: 'Unauthorized access to customer accounts'
      },
      {
        date: '2024-01-20',
        type: 'Policy Violation',
        amount: 3000,
        status: 'Resolved',
        description: 'Multiple compliance violations'
      },
      {
        date: '2024-01-05',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Resolved',
        description: 'Processing transactions outside approved hours'
      }
    ]
  },
  {
    shortCode: 'AG022',
    orgName: 'Manica Louge',
    infractionCount: 4,
    lastInfraction: '2024-03-10',
    clawbackAmount: 15000,
    accountStatus: 'Terminated',
    parentOrg: 'Parent Corp B',
    infractionHistory: [
      {
        date: '2024-03-10',
        type: 'Fraud',
        amount: 5000,
        status: 'Active',
        description: 'Systematic fraudulent activities detected'
      },
      {
        date: '2024-02-15',
        type: 'Security Breach',
        amount: 4000,
        status: 'Resolved',
        description: 'Unauthorized access to customer accounts'
      },
      {
        date: '2024-01-20',
        type: 'Policy Violation',
        amount: 3000,
        status: 'Resolved',
        description: 'Multiple compliance violations'
      },
      {
        date: '2024-01-05',
        type: 'Unauthorized Transaction',
        amount: 3000,
        status: 'Resolved',
        description: 'Processing transactions outside approved hours'
      }
    ]
  }
]

export default {
  setup() {
    const showDialog = ref(false)
    const selectedOrg = ref(null)

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'active': return 'negative'
        case 'frozen': return 'warning'
        case 'terminated': return 'negative'
        case 'resolved': return 'positive'
        case 'suspecious': return 'orange'
        default: return 'grey'
      }
    }

    const showHistory = (row) => {
      selectedOrg.value = row
      showDialog.value = true
    }

    return {
      columns,
      rows,
      getStatusColor,
      showHistory,
      showDialog,
      selectedOrg,
      filter: ref("")
    }
  }
}
</script>
