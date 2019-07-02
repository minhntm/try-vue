<template>
  <div class="col-full">
    <h1>Welcome to the forum</h1>
    <CategoryList :categories="categories"/>
  </div>
</template>

<script>
import sourceData from '@/data'
import CategoryList from '@/components/CategoryList'
export default {
  components: {
    CategoryList
  },

  data () {
    return {
      categories: Object.values(sourceData.categories)
    }
  }
}
</script>
