<template>
  <div
    class="q-pa-none"
    style="
      height: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
    "
  >
    <q-form style="width: 100%" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        dense
        v-model="email"
        label="Email"
        hint="name.surname@vm.co.mz"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please enter an email',
          (val) => val.includes('@vm.co.mz') || 'Email must be a vm.co.mz address',
        ]"
      />
      <q-input
        filled
        dense
        v-model="username"
        label="Username"
        hint="Your username"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please enter a username']"
      />

      <q-input
        v-if="isLocal"
        filled
        dense
        :type="isPwd ? 'password' : 'text'"
        v-model="password"
        label="Password"
        hint="Your passowrd"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please enter your password',
          (val) => val.length >= 8 || 'Password must be at least 8 characters long',
        ]"
      >
      <template v-slot:append>
          <q-icon
            size="20px"
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
    </q-input>
      <q-input
        v-if="isLocal"
        filled
        dense
        :type="isRePwd ? 'password' : 'text'"
        v-model="repassword"
        label="Confirm Password"
        hint="Confirm passowrd"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please confirm your password',
          (val) => val === password || 'Passwords do not match',
        ]"
      >
      <template v-slot:append>
          <q-icon 
            size="20px"
            :name="isRePwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isRePwd = !isRePwd"
          />
        </template>
    </q-input>

      <q-input
        filled
        dense
        v-model="ticketId"
        label="Ticket ID"
        hint="Your Ticket ID"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please enter your ticket ID']"
      />

      <q-select 
        filled v-model="department" 
        :options="options" 
        label="Department" dense>
      </q-select>

      <div class="q-mt-lg">
        <q-btn label="Reset" type="reset" color="negative" />
        <q-btn label="Submit" unelevated type="submit" color="secondary" class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { signup } from 'boot/auth' // Adjust this import path as necessary

// Grab the environment variable to determine if it's local or LDAP
const isLocal = import.meta.env.VITE_iSLOCAL

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const isPwd = ref(true)
    const isRePwd = ref(true)

    const email = ref('')
    const username = ref('')
    const password = ref('')
    const repassword = ref('')
    const ticketId = ref('')
    const department = ref('')

    const onSubmit = async () => {
      try {
        const result = await signup({
          email: email.value,
          username: username.value,
          password: password.value,
          ticketId: ticketId.value,
          department: department.value,
        })
        $q.notify({
          color: 'positive',
          message: 'Signup successful. Please wait for account activation or contact support.',
          icon: 'check',
        })
        // Redirect to login page after successful signup
        router.push('/')
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Signup failed. Please try again.',
          icon: 'report_problem',
        })
      }
    }

    const onReset = () => {
      email.value = ''
      username.value = ''
      password.value = ''
      repassword.value = ''
      ticketId.value = ''
      department.value = ''
    }

    const options = [
      { label: 'Compliance', value: 'compliance' },
      { label: 'Sales', value: 'sales' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' },
      { label: 'Support', value: 'support' },
      { label: 'Technology', value: 'technology' },
      { label: 'Customer Service', value: 'customer_service' },
      { label: 'Human Resources', value: 'human_resources' },
      { label: 'IT', value: 'it' },
      { label: 'Core & Digital', value: 'core_digital' },
      { label: 'Risk', value: 'risk' },
      { label: 'Business & Payments', value: 'business_payment' },
      { label: 'Financial Services', value: 'financial_services' },
    ]

    return {
      options,
      email,
      username,
      isPwd,
      isRePwd,
      password,
      repassword,
      ticketId,
      department,
      onSubmit,
      onReset,
      isLocal
    }
  },
}
</script>
