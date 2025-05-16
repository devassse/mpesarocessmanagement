<template>
  <div class="q-pa-md">
    <div style="max-width: 600px">
      <q-tabs
        v-model="tab"
        align="justify"
        narrow-indicator
        class="q-mb-lg"
      >
        <q-tab class="text-dark" name="approval" label="User Roles" />
        <q-tab class="text-dark" name="responses" label="Group Roles" />
      </q-tabs>

      <div class="q-gutter-y-sm">
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="scale"
          transition-next="scale"
          class="bg-white text-dark text-center"
        >
          <q-tab-panel name="approval">
            <div class="text-h6">User roles</div>
              <div v-if="roles.length > 0">
                <div class="text-subtitle2" v-for="role in roles" :key="role">{{role}}</div>
              </div>
              <div v-else > No roles assigned to your user </div>
          </q-tab-panel>

          <q-tab-panel name="responses">
            <div class="text-h6">Groups</div>
            <div v-if="userGroups.length > 0">
              <div class="text-subtitle2" v-for="Group in userGroups" :key="Group.name">{{Group.name}}</div>
            </div>
            <div v-else > No roles assigned to your user </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'

export default {
  async created () {

    let roles = await this.$roles.getCurrentUserRoles()
    this.roles = roles.roles

    let userGroups = await this.$roles.getCurrentUserGroups()
    this.userGroups = userGroups.groups
  },
  setup () {
    return {
      tab: ref('approval'),
      roles: ref([]),
      userGroups: ref([])
    }
  }
}
</script>
