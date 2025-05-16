<template>
  <div class="q-pa-md bg-accent appearBox2" style="height: 100vh;">
    <q-card class="bg-white q-pt-md" flat>
      <div class="image-avatar-1 bg-dark" style="border-radius: 100%;">
        <img :src="images.checklist" style="position: absolute; object-position: fit; height: 60%; width: 60%">
      </div>

      <q-card-section class="text-center q-pt-sm text-dark">
        <div class="text-h6">Audit Log</div>
        <div class="text-caption">Ensure that your code is future-proof and more readable</div>
      </q-card-section>

      <q-card-actions align="left" class="row q-gutter-sm">
        <div class="col-grow">
          <div class="text-caption text-grey">From Date</div>
          <q-input dense filled v-model="fromDate" @update:model-value="onFilterChange">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="fromDate" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="fromDate" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-grow">
          <div class="text-caption text-grey">To Date</div>
          <q-input dense filled v-model="toDate" @update:model-value="onFilterChange">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="toDate" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="toDate" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-grow">
          <div class="text-caption text-grey">Search by user</div>
          <q-input
            filled
            v-model="userSearch"
            dense
            placeholder="email"
            @update:model-value="onFilterChange"
          >
            <template v-slot:append>
              <q-icon color="primary" name="person" />
            </template>
          </q-input>
        </div>
      </q-card-actions>

      <q-table
        flat
        bordered
        ref="tableRef"
        title="Audit Logs"
        :rows="rows"
        :columns="columns"
        row-key="_id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        binary-state-sort
        @request="onRequest"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getUserLogs } from 'src/boot/roles'
import images from 'src/boot/images';

const columns = [
  {
    name: 'user',
    required: true,
    label: 'User',
    align: 'left',
    field: row => row.user.username,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'actionDescription', align: 'left', label: 'Action', field: 'actionDescription', sortable: true },
  { name: 'timestamp', label: 'Timestamp', field: 'timestamp', sortable: true }
]

export default {
  setup () {
    const tableRef = ref(null)
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'timestamp',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 0
    })
    const fromDate = ref(null)
    const toDate = ref(null)
    const userSearch = ref('')

    const fetchLogs = async () => {
      loading.value = true
      try {
        const { page, rowsPerPage, sortBy, descending } = pagination.value
        const data = await getUserLogs(page, rowsPerPage, {
          fromDate: fromDate.value,
          toDate: toDate.value,
          userSearch: userSearch.value,
          filter: filter.value,
          sortBy,
          descending
        })
        rows.value = data.logs
        pagination.value.rowsNumber = data.totalLogs
      } catch (error) {
        console.error('Error fetching logs:', error)
        // Handle error (e.g., show error message to user)
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
      fetchLogs()
    }

    const onFilterChange = () => {
      pagination.value.page = 1
      fetchLogs()
    }

    watch([filter, fromDate, toDate, userSearch], onFilterChange)

    onMounted(() => {
      fetchLogs()
    })

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      fromDate,
      toDate,
      userSearch,
      onRequest,
      onFilterChange,
      images
    }
  }
}
</script>

<style>
.image-avatar-1 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  width: 100px;
  margin: 0 auto;
  padding-left: 4px;
}
</style>
