<template>
  <div class="q-pa-md">
    <q-drawer
      :model-value="drawer"
      @update:model-value="updateDrawer"
      :width="300"
      :breakpoint="500"
      overlay
      dark
      style="border-left: solid .5px #22222250;"
      class="bg-secondary"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item class="text-white" :active="true">
            <q-item-section avatar>
              <q-icon name="draw" />
            </q-item-section>
            <q-item-section>
              Created By
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item class="text-white" :active="true">
            <q-item-section>
              {{file?.createdBy?.email || 'none'}}
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item class="text-white" :active="true">
            <q-item-section avatar>
              <q-icon name="assignment_turned_in" />
            </q-item-section>
            <q-item-section>
              Approval Requests
            </q-item-section>
          </q-item>
          <q-separator />
          <div v-if="file.approvalRequests && file.approvalRequests.length > 0">
            <q-item v-for="request in file.approvalRequests" :key="request.user.email" class="text-white" :active="true">
              <q-item-section avatar>
                <q-icon :name="getStatusIcon(request.status)" :color="getStatusColor(request.status)" />
              </q-item-section>
              <q-item-section>
                {{ request.user.email }}
              </q-item-section>

              <q-item-section side v-if="request.canApprove">
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn flat round size="sm" color="positive" icon="check" @click="handleApprove(request)" />
                  <q-btn flat round size="sm" color="negative" icon="close" @click="handleReject(request)" />
                </div>
              </q-item-section>
            </q-item>
          </div>
          <div v-else>
            <q-item class="text-white" :active="true">
              <q-item-section avatar>
                <q-icon name="highlight_off" color="red" />
              </q-item-section>
              <q-item-section>
                No requests
              </q-item-section>
            </q-item>
          </div>
          <q-item class="text-white bg-dark q-mt-md q-mb-sm" :active="true">
            <q-item-section avatar>
              <q-icon name="file_download" />
            </q-item-section>
            <q-item-section>
              Download Uploaded Files
            </q-item-section>
          </q-item>
          <q-item
            v-for="file in gridFSFileInfos"
            :key="file._id"
            @click="handleDownload(file._id, file.filename.content_type)"
            clickable
            v-ripple
          >
            <q-item-section avatar top>
              <q-avatar icon="description" color="dark" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ file.filename.filename.substring(0, 25) }}</q-item-label>
              <q-item-label caption>{{ file.filename.content_type }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="file_download" color="dark" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script>
export default {
  name: 'DrawerComponent',
  props: {
    drawer: {
      type: Boolean,
      required: true
    },
    gridFSFileInfos: {
      type: Array,
      default: () => []
    },
    file: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // You can add any reactive data here if needed
    }
  },
  methods: {
    updateDrawer(value) {
      this.$emit('update:drawer', value)
    },
    async handleDownload(fileId, content_type) {
      try {
        await this.$directories.downloadFile(fileId, content_type);
      } catch (error) {
        console.error('Error downloading file:', error);
        // You might want to show an error message to the user here
      }
    },
    getStatusIcon(status) {
      if (status === 'pending') return 'error';
      if (status === 'approved') return 'check_circle';
      if (status === 'rejected') return 'highlight_off';
      return 'help'; // Default icon in case status is unknown
    },
    getStatusColor(status) {
      if (status === 'pending') return 'yellow';
      if (status === 'approved') return 'green';
      if (status === 'rejected') return 'red';
      return 'grey'; // Default color in case status is unknown
    },
    async handleApprove(request) {
      try {
        // Show confirmation dialog
        this.$q.dialog({
          title: 'Confirm Approval',
          message: `Are you sure you want to approve the request from ${request.user.email}?`,
          prompt: {
            model: '',
            type: 'text'
          },
          cancel: true,
          persistent: true
        }).onOk(async (reason) => {
          // Call the updateApprovalRequest method from the boot file
          await this.$directories.updateApprovalRequest(
            this.file._id,
            request._id,
            'approved',
            reason
          );

          // Update the local state
          request.status = 'approved';
          request.canApprove = false;
          this.$emit('request-updated');

          // Show success message
          this.$q.notify({
            color: 'positive',
            message: 'Request approved successfully',
            icon: 'check'
          });
        });
      } catch (error) {
        console.error('Error approving request:', error);
        // Show error message
        this.$q.notify({
          color: 'negative',
          message: 'Error approving request. Please try again.',
          icon: 'error'
        });
      }
    },
    async handleReject(request) {
      try {
        // Show confirmation dialog
        this.$q.dialog({
          title: 'Confirm Rejection',
          message: `Are you sure you want to reject the request from ${request.user.email}?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          // Call your API to reject the request
          await this.$api.rejectRequest(this.file._id, request.user._id);
          // Update the local state
          request.status = 'rejected';
          request.canApprove = false;
          this.$emit('request-updated');
          // Show success message
          this.$q.notify({
            color: 'info',
            message: 'Request rejected successfully',
            icon: 'info'
          });
        });
      } catch (error) {
        console.error('Error rejecting request:', error);
        // Show error message
        this.$q.notify({
          color: 'negative',
          message: 'Error rejecting request. Please try again.',
          icon: 'error'
        });
      }
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
