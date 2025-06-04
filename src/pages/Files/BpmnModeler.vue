<template>
  <div :id="`canvas${index}`" class="q-mt-xl" style="height: 450px; border-top: 1px solid #dddddd;"></div>
</template>

<script>
import Modeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';

export default {
  name: 'BpmnModeler',
  props: {
    bpmnXML: {
      type: String,
      required: true
    },
    index: {
      type: Number
    }
  },
  data() {
    return {
      modeler: null
    };
  },
  mounted() {
    this.initializeModeler();
  },
  methods: {
    async initializeModeler() {
      this.modeler = new Modeler({
        container: `#canvas${this.$props.index}`,
        additionalModules: [
          minimapModule
        ]
      });

      try {
        await this.modeler.importXML(this.bpmnXML);
        console.log('Awesome! Ready to navigate!');
      } catch (err) {
        console.error('Error importing BPMN diagram', err);
      }
    }
  }
};
</script>

<style scoped>
#canvas {
  width: 100%;
  height: 100%;
}
</style>
