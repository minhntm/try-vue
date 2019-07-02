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
import sourceData from '@/data.json'
export default {
  props: {
    post: {
      required: true,
      type: Object
    }
  },
  computed: {
    user () {
      return sourceData.users[this.post.userId]
    },
    userPostsCount () {
      return Object.keys(this.user.posts).length
    }
  }
}
</script>

<style>
</style>
