// src/components/FolderImage.vue
<template>
  <img :src="folderImage" :alt="folderName">
</template>

<script>
import images from "src/boot/images"

export default {
  name: 'FolderImage',
  props: {
    folderName: {
      type: String,
      required: true
    }
  },
  computed: {
    folderImage() {
      // Convert folder name to lowercase once for all comparisons
      const lowerName = this.folderName.toLowerCase()

      // Image mapping with lowercase keys
      const imageMapping = {
        'business': images.fp_business,
        'digital': images.fp_digital,
        'marketing': images.fp_marketing,
        'operations': images.fp_operations,
        'compliance': images.fp_compliance,
        'financial': images.fp_financial,
        'finance': images.fp_finance,
        'sales': images.fp_sales,
        'technology': images.fp_technology,
        'configuration': images.fp_configuration,
        'quality control': images.fp_quality_control,
        'corporate': images.fp_corporate,
        'service management': images.fp_service_management,
        'risk': images.fp_risk
      }

      // Find the first matching key
      const matchingKey = Object.keys(imageMapping).find(key =>
        lowerName.includes(key.toLowerCase())
      )

      // Return matching image or default folder image
      return matchingKey ? imageMapping[matchingKey] : images.folder
    }
  }
}
</script>
