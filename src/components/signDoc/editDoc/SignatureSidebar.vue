<template>
  <div class="signature-sidebar">
    <q-card class="bg-secondary" flat>
      <q-card-section>
        <div class="text-h6">Signature Options</div>
        <q-radio v-model="signatureType" val="self" label="Sign as myself" />
        <q-radio v-model="signatureType" val="other" label="Sign as someone else" />

        <template v-if="signatureType === 'self'">
          <q-btn unelevated color="dark" @click="showSignature = true" class="q-mt-md">
            Add Signature
          </q-btn>
        </template>

        <template v-else>
          <q-select v-model="selectedSigner" :options="signerOptions" label="Select Signer" class="q-mt-md" />
        </template>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showSignature">
      <q-card style="min-width: 350px">
        <SignaturePage @signature-saved="handleSignatureSave" />
      </q-card>
    </q-dialog>
  </div>
 </template>

 <script>
 import { ref } from 'vue'
 import SignaturePage from './GetSignature.vue'

 export default {
  components: { SignaturePage },
  setup() {
    const signatureType = ref('self')
    const selectedSigner = ref(null)
    const signature = ref(null)
    const showSignature = ref(false)

    const signerOptions = [
      { label: 'John Doe', value: 'john' },
      { label: 'Jane Smith', value: 'jane' }
    ]

    const handleSignatureSave = (signatureInfo) => {
      signature.value = signatureInfo
      showSignature.value = false
    }

    return {
      signatureType,
      selectedSigner,
      signerOptions,
      showSignature,
      handleSignatureSave
    }
  }
 }
 </script>
