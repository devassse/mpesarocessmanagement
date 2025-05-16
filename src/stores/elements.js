import { defineStore } from 'pinia'

export const useElementsStore = defineStore('elements', {
  state: () => ({
    elements: new Map(),
    currentPage: 1
  }),
  getters: {
    getCurrentPageElements: (state) => state.elements.get(state.currentPage) || []
  },
  actions: {
    setCurrentPage(page) {
      this.currentPage = page
    },
    addElement(element) {
      const pageElements = this.elements.get(this.currentPage) || []
      pageElements.push(element)
      this.elements.set(this.currentPage, pageElements)
    },
    removeElement(id) {
      const pageElements = this.elements.get(this.currentPage) || []
      const filtered = pageElements.filter(el => el.id !== id)
      this.elements.set(this.currentPage, filtered)
    },
    updateElementPosition(id, position) {
      const pageElements = this.elements.get(this.currentPage) || []
      const element = pageElements.find(el => el.id === id)
      if (element) {
        element.position = position
        this.elements.set(this.currentPage, pageElements)
      }
    },
    setSet() {

    }
  }
})
