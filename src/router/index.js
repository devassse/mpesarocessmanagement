import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import Cookies from 'js-cookie'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const getCookie = async (name) => {
  if (isElectron) {
    return await window.electronAPI.getCookie(name)
  } else {
    return Cookies.get(name)
  }
}

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const token = await getCookie('authToken')
    if (!token && to.path !== '/login') {
      next('/login')
    } else if (token && to.path === '/login') {
      next('/')  // Redirect to home if user is already authenticated
    } else {
      next()
    }
  })

  return Router
})
