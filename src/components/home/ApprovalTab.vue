<template>
  <div class="q-pa-md">
    <div style="max-width: 600px">
      <q-tabs
        v-model="tab"
        align="justify"
        narrow-indicator
        class="q-mb-lg"
      >
        <q-tab class="text-secondary" name="approval" label="Approval Requests" />
        <q-tab class="text-dark" name="responses" label="Received Responses" />
      </q-tabs>
      <div class="q-gutter-y-sm">
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="scale"
          transition-next="scale"
          class="bg-white text-dark"
        >
          <q-tab-panel name="approval" style="max-height: 250px; overflow-y:scroll">

            <q-list bordered separator style="max-height: 250px; overflow-y: auto;">
              <q-item v-for="request in approverRequests" :key="request.fileId" class="q-my-sm">
                <q-item-section>
                  <q-item-label class="text-h6">{{ request.fileName }}</q-item-label>
                  <q-item-label caption>Title: {{ request.fileTitle }}</q-item-label>
                  <q-item-label caption>Created by: {{ request.createdBy.username }} ({{ request.createdBy.email }})</q-item-label>
                  <q-item-label caption>Requested on: {{ new Date(request.requestDate).toLocaleDateString() }}</q-item-label>
                  <q-item-label class="q-mt-sm">
                    <q-btn class="q-mt-md" unelevated
                      color="dark"
                      label="View File"
                      :to="'/files/' + request.fileId"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-inner-loading :showing="loadingRequests">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </q-tab-panel>
          <q-tab-panel style="max-height: 250px; overflow-y:scroll" name="responses">
            <q-list class="" bordered separator>
              <q-item v-for="response in approvalResponses" :key="response.id" class="q-my-sm">
                <q-item-section >
                  <q-item-label class="text-h6">{{ response.fileName }}</q-item-label>
                  <q-item-label>
                    Status:
                    <q-chip
                      :color="response.status === 'approved' ? 'positive' : 'negative'"
                      text-color="white"
                      dense
                    >
                      {{ response.status }}
                    </q-chip>
                  </q-item-label>
                  <q-item-label class="q-mt-sm">
                    <strong>Reason:</strong>
                  </q-item-label>
                  <q-item-label class="q-pl-md">
                    {{ response.reason || 'No reason provided' }}
                  </q-item-label>
                  <q-item-label class="q-mt-sm">
                    <q-btn class="q-mt-md" unelevated
                      color="dark"
                      label="View File"
                      :to="'/files/' + response.fileId"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-inner-loading :showing="loadingResponses">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getApprovalResponses, getApproverRequests } from 'boot/roles'

export default {
  setup () {
    const $q = useQuasar()
    const tab = ref('approval')
    const approvalResponses = ref([])
    const approverRequests = ref([])
    const loadingResponses = ref(false)
    const loadingRequests = ref(false)

    const fetchApprovalResponses = async () => {
      loadingResponses.value = true
      try {
        approvalResponses.value = await getApprovalResponses()
      } catch (error) {
        console.error('Error fetching approval responses:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to load approval responses',
          icon: 'report_problem'
        })
      } finally {
        loadingResponses.value = false
      }
    }

    const fetchApproverRequests = async () => {
      loadingRequests.value = true
      try {
        approverRequests.value = await getApproverRequests()
      } catch (error) {
        console.error('Error fetching approver requests:', error)
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to load approver requests',
          icon: 'report_problem'
        })
      } finally {
        loadingRequests.value = false
      }
    }

    onMounted(() => {
      fetchApprovalResponses()
      fetchApproverRequests()
    })

    return {
      tab,
      approvalResponses,
      approverRequests,
      loadingResponses,
      loadingRequests
    }
  }
}
</script>
