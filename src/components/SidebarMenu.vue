<template>
  <q-item
    active-class="text-dark"
    clickable
    :to="props.link"
    :active="$route.path == props.link"
  >
    <q-item-section
      v-if="props.icon"
      avatar
    >
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineOptions({
  name: 'SidebarMenu'
})

const props = defineProps({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    default: '#'
  },

  icon: {
    type: String,
    default: ''
  }
})
</script>

<style>
.appearBox {
  animation: fadeIn 500ms forwards;
  /* Apply the animation */
}


@keyframes fadeIn {
  from {
    opacity: .3;
  }

  to {
    opacity: 1;
  }
}

.appearBox2 {
  animation: fadeIn 1000ms forwards;
  /* Apply the animation */
}


@keyframes fadeIn {
  from {
    opacity: .4;
  }

  to {
    opacity: 1;
  }
}
</style>
