<template>
  <div class="post">
    <div class="user-info">
      <a href="#" class="user-name">{{user.name}}</a>
      <a href="#">
        <img :src="user.avatar" alt="" class="avatar-large">
      </a>

      <p class="desktop-only text-small">
        {{userPostsCount}} posts
      </p>
    </div>

    <div class="post-content">
      <div>{{post.text}}</div>
    </div>

    <AppDate
      class="post-date text-faded"
      :timestamp="post.publishedAt"
    />
  </div>
</template>

<script>
import { countObjectProperties } from '@/utils'
export default {
  props: {
    post: {
      required: true,
      type: Object
    }
  },
  computed: {
    user () {
      return this.$store.state.users[this.post.userId]
    },
    userPostsCount () {
      return countObjectProperties(this.user.posts)
    }
  }
}
</script>

<style>
</style>
