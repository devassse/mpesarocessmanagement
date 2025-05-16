<template>
  <div class="q-pa-md q-gutter-sm" style="overflow-y: scroll; max-height: 100%">
    <q-input ref="filterRef" dense filled v-model="filter" label="Filter">
      <template v-slot:append>
        <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
      </template>
    </q-input>
    <q-tree
      :nodes="directoryNodes"
      node-key="id"
      :filter="filter"
      default-expand-all
      :selected="selectedNode"
      selected-color="dark"
      @update:selected="onNodeSelect"
      no-nodes-label="No Folder(s) Available!"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon :name="prop.node.icon" color="primary" size="28px" class="q-mr-sm" />
          <div :class="{'text-weight-bold': prop.node.id === selectedNode}">
            {{ prop.node.label }}
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getDirectoryStructure } from 'boot/directories' // Adjust this path
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'DirectoryTree',

  setup () {
    const filter = ref('')
    const filterRef = ref(null)
    const directoryNodes = ref([])
    const selectedNode = ref(null)
    const router = useRouter()
    const route = useRoute()

    const resetFilter = () => {
      filter.value = ''
      filterRef.value.focus()
    }

    const fetchDirectoryStructure = async () => {
      try {
        const structure = await getDirectoryStructure()
        directoryNodes.value = transformStructure(structure)
        updateSelectedNodeFromRoute()
      } catch (error) {
        console.error('Error fetching directory structure:', error)
        // Handle error (e.g., show a notification to the user)
      }
    }

    const transformStructure = (items) => {
      return items.map(item => ({
        id: item._id,
        label: item.name,
        children: item.children ? transformStructure(item.children) : undefined,
        icon: item.type === 'directory' ? 'folder' : 'insert_drive_file',
        type: item.type,
        url: item.type === 'directory' ? `/dir/${item._id}` : `/files/${item._id}`
      }))
    }

    const onNodeSelect = (nodeId) => {
      selectedNode.value = nodeId
      const selectedItem = findNodeById(directoryNodes.value, nodeId)
      if (selectedItem && selectedItem.url) {
        router.push(selectedItem.url)
      }
    }

    const findNodeById = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    const updateSelectedNodeFromRoute = () => {
      const currentId = route.params.dir || route.params.id
      if (currentId) {
        const node = findNodeById(directoryNodes.value, currentId)
        if (node) {
          selectedNode.value = node.id
        }
      }
    }

    onMounted(() => {
      fetchDirectoryStructure()
    })

    watch(() => route.params, (newParams) => {
      updateSelectedNodeFromRoute()
    })

    return {
      filter,
      filterRef,
      directoryNodes,
      resetFilter,
      selectedNode,
      onNodeSelect
    }
  }
}
</script>

<style scoped>
.q-tree__node--selected {
  background-color: rgba(25, 118, 210, 0.1);
}
</style>
