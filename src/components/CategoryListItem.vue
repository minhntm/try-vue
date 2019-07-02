<template>
  <div class="forum-list">
    <h2 class="list-title">
      <router-link :to="{name: 'Category', params: {id: category['.key']}}">
        {{category.name}}
      </router-link>
    </h2>

    <ForumList :forums="forums"/>
  </div>
</template>

<script>
import ForumList from './ForumList'
import sourceData from '@/data.json'
export default {
  components: {
    ForumList
  },

  props: {
    category: {
      required: true,
      type: Object
    }
  },

  computed: {
    forums () {
      return Object.values(sourceData.forums)
        .filter(forum => forum.categoryId === this.category['.key'])
    }
  }
}
</script>

<style>
</style>
