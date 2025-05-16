<template>
  <q-list bordered separator>
    <transition-group name="list" appear>

      <q-item v-for="item in elementsStore.getCurrentPageElements" :key="item.id" :to="`${$route.path}/signature/${item.id}`" clickable v-ripple>
        <q-item-section avatar>

          <q-icon :name="getIconByType(item.data.type)" />
        </q-item-section>
        <q-item-section>
          {{ item.content }}
          <q-item-label caption>
            Position: {{ Math.round(item.position.x) }}, {{ Math.round(item.position.y) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round icon="delete" color="grey-6" @click="elementsStore.removeElement(item.id)" />
        </q-item-section>
      </q-item>
    </transition-group>
  </q-list>
</template>
<script>

import { useElementsStore } from 'stores/elements'
import { useRouter } from 'vue-router';

export default {
  name: 'DroppedElementsList',
  setup() {
    const elementsStore = useElementsStore()

    // useRouter()

    const getIconByType = (type) => ({
      signature: 'draw'
    }[type] || 'article')

    return {
      elementsStore,
      getIconByType
    }
  }
}
</script>
<style>
.list-enter-active,
.list-appear-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-appear-from {
  opacity: 0;
  transform: translateY(30px);
}
</style>
