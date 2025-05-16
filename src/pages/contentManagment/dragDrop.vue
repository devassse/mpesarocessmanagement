<template>
  <div>
    <div
      class="draggable q-ml-sm q-mr-sm q-mb-sm"
      style="position: relative;"
      v-for="(item, index) in items"
      :key="item.label"
      draggable="true"
      @dragstart="onDragStart($event, index)"
      @dragend="onDragEnd"
      @dragover="onDragOver($event, index)"
      @drop="onDrop($event, index)"
      @dragenter="onDragEnter($event, index)"
      @dragleave="onDragLeave($event, index)"
      v-ripple
    >
      <q-item-section>
        {{ item.subtitle }}
      </q-item-section>
      <q-item-section avatar>
        <q-avatar color="primary" text-color="secondary" icon="drag_indicator" />
      </q-item-section>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dragIndex: null,
      dropIndex: null
    };
  },
  methods: {
    onDragStart(event, index) {
      this.dragIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      let element_ = document.querySelector(`.${this.items[index].label}`)
      element_.classList.add('disappear');
      event.target.classList.add('dragging');
      setTimeout(()=> {
        event.target.classList.add('dragging');
      },50)
    },
    onDragEnd(event) {
      this.clearAnimations();
    },
    onDrop(event, index) {
      if (index !== this.dragIndex) {
        const newItems = [...this.items];
        const draggedItem = newItems.splice(this.dragIndex, 1)[0];
        newItems.splice(index, 0, draggedItem);
        this.$emit('update:items', newItems);
        this.dragIndex = null;
        this.dropIndex = null;
        const selectForAnime = document.querySelector(`.${draggedItem.label}`)
        selectForAnime.classList.add('appearing')
        this.clearAnimations();
      }
    },
    onDragOver(event, index) {
      event.preventDefault();
      if (index !== this.dragIndex) {
        this.animateDrop(event.target)
      }
    },
    onDragEnter(event, index) {
      if (index !== this.dragIndex) {
        this.animateDrop(event.target);
        this.dropIndex = index;
      }
    },
    onDragLeave(event) {
      event.target.classList.remove('dropping');
    },
    animateDrop(target) {
      target.classList.add('dropping');
    },
    clearAnimations() {
      const draggables = this.$el.querySelectorAll('.draggable');
      draggables.forEach(draggable => draggable.classList.remove('dragging', 'dropping'));
      document.querySelectorAll(".disappear").forEach((item)=> item.classList.remove("disappear"))
      setTimeout(() => {
        const selectForAnime = document.querySelectorAll(`.appearing`)

        selectForAnime.forEach(animeItem => animeItem.classList.remove('appearing'));
      },500)
    }
  }
};
</script>

<style>
.draggable {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  color: black;
  background-color: #dddddd;
  border-radius: 8px;
  cursor: move;
  transition: background-color 0.1s ease, opacity 0.3s ease;
}

.draggable.dragging {
  opacity: 0.5;
  border: dotted .5px #222222;
}

.draggable.dropping {
  background-color: #c3e5ae;
}

.appearing {
  animation: appear .4s forwards;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.disappear {
  animation: disappear 0.5s ease-out forwards; /* 0.5s duration, ease-out timing, and forwards fill mode */
}
@keyframes disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

</style>
