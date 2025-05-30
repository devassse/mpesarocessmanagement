<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      show-if-above
      v-model="drawer"
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      dark
      :width="200"
      :breakpoint="500"
      :class="$q.dark.isActive ? 'bg-grey-3' : 'bg-secondary'"
    >
      <q-list style=" height: 100%">
        <SidebarMenu
          v-for="link in filteredLinksList"
          :key="link.title"
          v-bind="link"
        />
        <q-item
        :style="`position: absolute;  width: 100%;  top: calc(100vh - ${70}px)`"
          clickable
          v-ripple
          @click="logout"
          :class="$q.dark.isActive ? 'text-grey-1 ' : 'text-white '"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SidebarMenu from 'components/SidebarMenu.vue'
import Cookies from 'js-cookie'

defineOptions({
  name: 'MainLayout'
})

const router = useRouter()

const linksList = [
  {
    title: 'Me',
    icon: 'person',
    link: '/'
  },
  {
    title: 'Directory',
    icon: 'folder',
    link: '/home'
  },
  {
    title:'Reports',
    icon: 'analytics',
    link: '/reports',
  },
  {
    title:'Ticket Flow',
    icon: 'sell',
    link: '/ticket-flow',
  },
  {
    title: 'Claw Back',
    icon: 'policy',
    link: '/claw-back',
    adminOrAuditor: true
  },
  {
    title: 'Voda Sign',
    icon: 'fact_check',
    link: '/doc-main',
    adminOnly: true
  },
  // Hidden for a While
  // {
  //   title: 'Face Recognition',
  //   icon: 'familiar_face_and_zone',
  //   link: '/face-recognition',
  //   adminOnly: true
  // },
  {
    title: 'Create Group',
    icon: 'group',
    link: '/create-group',
    adminOnly: true
  },
  {
    title: 'Roles',
    icon: 'supervised_user_circle',
    link: '/roles',
    adminOnly: true
  },
  {
    title: 'Audit Log',
    icon: 'work_history',
    link: '/users-logs',
    adminOrAuditor: true
  }
]

const isElectron = ref(false)
const isAdmin = ref(false)
const isAuditor = ref(false)
let linksListLength = ref(4)

onMounted(async () => {
  isElectron.value = !!window.electronAPI
  await initializeCookieValues()
  await checkAuthToken()
})

const getCookie = async (name) => {
  if (isElectron.value) {
    return await window.electronAPI.getCookie(name)
  } else {
    return Cookies.get(name)
  }
}

const deleteCookie = async (name) => {
  if (isElectron.value) {
    await window.electronAPI.deleteCookie(name)
  } else {
    Cookies.remove(name)
  }
}

const initializeCookieValues = async () => {
  isAdmin.value = (await getCookie('isAdmin')) === 'true'
  isAuditor.value = (await getCookie('isAuditor')) === 'true'
}

const checkAuthToken = async () => {
  const token = await getCookie('authToken')
  if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

const logout = async () => {
  const cookiesToRemove = ['authToken', 'isAdmin', 'isAuditor', "isEditor", "isViewer"]
  for (const cookie of cookiesToRemove) {
    await deleteCookie(cookie)
  }
  router.push('/login')
}

const filteredLinksList = computed(() => {
  return linksList.filter(link => {
    if (link.adminOnly && !isAdmin.value) return false
    if (link.adminOrAuditor && !isAdmin.value && !isAuditor.value) return false
    return true
  })
})

const miniState = ref(true)
const drawer = ref(false)

</script>
