<template>
  <div class="q-pa-md row items-center justify-center bg-accent" style="height: 105vh">
    <q-card class="my-card" flat bordered>
      <q-card-section horizontal>
        <q-card-section class="q-pa-none q-pt-md" style="min-width: 54%">
          <q-tabs v-model="tab" align="justify" narrow-indicator class="q-mb-lg">
            <q-tab class="text-dark q-ml-md" name="login" label="Login" />
            <q-tab class="text-secondary" name="register" label="Register" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated transition-prev="scale" transition-next="scale"
            class="text-dark text-center q-pa-none">
            <q-tab-panel name="login">
              <div class="text-h6 q-mt-xl">Login to M-Pesa Business <br/> Catalog</div>
              <div class="text-caption q-pb-lg">It Makes working fun!</div>
              <LoginPage />
            </q-tab-panel>
            <q-tab-panel name="register">
              <div class="text-h6">Signup to M-Pesa Business <br/> Catalog</div>
              <div class="text-caption q-pb-lg">Join us on this journey of improving our work place</div>
              <SignupPage />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-img style="min-height: 500px;" class="col-5 q-ma-md q-ml-none" :src="loginImage">
          <div class="text-caption text-uppercase img-card q-pt-xl">
            "Unlocking the full potential of our corporate with the M-Pesa Business Catalog, your comprehensive digital resource for managing and optimizing every aspect of your operations."
          </div>
        </q-img>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import LoginPage from "src/components/login/UserLoginPage.vue"
import SignupPage from 'src/components/login/SignupPage.vue'
import loginImage from 'src/assets/login.webp'

export default {
  components: {
    LoginPage,
    SignupPage
  },
  setup () {
    return {
      tab: ref('login'),
      loginImage
    }
  }
}
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 800px;
  min-height: 500px;
}
.img-card {
  bottom: 0;
  background: rgb(2,0,36);
  background: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(0,0,0,0.7581626400560224) 54%, rgba(34,34,34,0) 100%);
}
</style>
