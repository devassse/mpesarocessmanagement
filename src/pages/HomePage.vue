<template>
  <div class="bg-dark">
    <q-card class="bg-dark q-pt-xl" style="border:0" flat>
      <div class="image-avatar-1 bg-secondary" style="border-radius: 100%;">
        <img :src="images.business" class="appearBox" style="position: absolute; object-position: fit; height: 90%; width: 90%; right: 5px">
      </div>

      <q-card-section class="text-center q-pt-sm text-white appearBox">
        <div class="text-h6">Welcome {{ user.name || user.username }}, to M-Pesa Catalog</div>
        <div class="text-caption">
          We enhance operational efficiency and streamline workflows by digitizing all M-Pesa processes. <br/>
          Our web catalog, supported by a CMS, improves accessibility, ensures timely updates, and keeps all stakeholders informed, <br/>
          optimizing processes and monitoring business workflows.
        </div>
      </q-card-section>
    </q-card>
  </div>
  <div class="bg-secondary text-white">
    <q-toolbar class="bg-dark">
      <div class="text-subtitle text-white">Sponsored by: M-Pesa Operations Team</div>
      <q-space></q-space>
      <q-btn flat round dense icon="info" @click="showTributes = true" />
    </q-toolbar>
  </div>
  <div class="row bg-accent q-pa-md appearBox" style="min-height: calc(100vh - 240px)">
    <div class="col q-mr-md">
      <q-card flat class="bg-white">
        <q-card-section>
          <div class="text-h6">User Details</div>
          <div class="text-subtitle2">Review your personal details in the View your <br> Profile Information section.</div>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-white q-mt-md" style="min-height: 345px">
        <div class="text-subtitle2 q-pt-lg q-pl-md q-mb-md">Information:</div>
        <q-list class="text-grey-7 q-mb-md" style="min-height: 200px;">
          <q-item>
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>
              <q-item-label>User email</q-item-label>
              <q-item-label class="text-dark">{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Username</q-item-label>
              <q-item-label class="text-dark">{{ user.username }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="toggle_on" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Account Status</q-item-label>
              <q-item-label class="text-dark">{{ user.status }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

      </q-card>
    </div>
    <div class="col">
      <q-card flat class="bg-white">
        <q-card-section>
          <div class="text-h6">Tasks</div>
          <div class="text-subtitle2">Stay organized and on top of your duties with<br> the Tasks section.</div>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-white q-mt-md" style="min-height: 345px">
        <ApprovalTab />
      </q-card>
    </div>
    <div class="col q-ml-md">
      <q-card flat class="bg-white">
        <q-card-section>
          <div class="text-h6">Roles and Permissions</div>
          <div class="text-subtitle2">Manage user access and control within the Roles <br> and Permissions section.</div>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-white q-mt-md" style="min-height: 345px">
        <UserRoles />
      </q-card>
    </div>
  </div>

  <!-- Tributes Dialog -->
  <q-dialog v-model="showTributes">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Tributes</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <p>Created By:</p>
       <ul>
       <li>Head of Operations: Lucrecia Muianga</li>
       <li>Dev Ops: Ivan Simon</li>
       <li>Quality Control: Mussa Opaite</li>
       <li>Support team: Process Automation and Business Efficiency Team</li>
       </ul>
       <p>Together, we're revolutionizing M-Pesa processes and enhancing operational efficiency.</p>
       </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted } from 'vue'
import ApprovalTab from "../components/home/ApprovalTab.vue"
import UserRoles from "../components/home/UserRoles.vue"
import { getCurrentUser } from 'boot/auth'; // Import the getCurrentUser function
import Cookies from 'js-cookie'; // Import js-cookie
import images from 'src/boot/images';


export default {
  components: {
    ApprovalTab, UserRoles
  },
  setup() {
    const user = ref({
      name: '',
      email: '',
      username: '',
      status: ''
    });
    const showTributes = ref(false);

    const authToken = Cookies.get('authToken'); // Get auth token from cookies

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(authToken);
        user.value = userData;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    onMounted(fetchUserData);

    return {
      user,
      showTributes,
      images
    };
  }
}
</script>

<style lang="scss">
.image-avatar-1 {
  border-radius: 50px 20px;
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
