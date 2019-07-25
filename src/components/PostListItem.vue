<template>
  <div v-if="post && user" class="post">
    <div class="user-info">
      <a href="#" class="user-name">{{user.name}}</a>
      <a href="#">
        <img :src="user.avatar" alt="" class="avatar-large">
      </a>

      <p class="desktop-only text-small">{{userPostsCount}} posts</p>
      <p class="desktop-only text-small">{{userThreadsCount}} threads</p>
    </div>

    <div class="post-content">
       <template v-if="!editing">
        <div>{{post.text}}</div>
        <a
          @click.prevent="editing = true"
          href="#"
          class="link-unstyled"
          style="margin-left: auto"
          title="Make a change"
        >
          <i class="fa fa-pencil"></i>
        </a>
      </template>
      <div v-else>
        <PostEditor
          :post="post"
          @save="editing = false"
          @cancel="cancel"
        />
      </div>
    </div>

    <div class="post-date text-faded">
      <div v-if="post.edited" class="edition-info">edited</div>
      <AppDate :timestamp="post.publishedAt"/>
    </div>
  </div>
</template>

<script>
import PostEditor from './PostEditor'
export default {
  components: {
    PostEditor
  },

  props: {
    post: {
      required: true,
      type: Object
    }
  },

  data () {
    return {
      editing: false
    }
  },

  computed: {
    user () {
      return this.$store.state.users.items[this.post.userId]
    },
    userPostsCount () {
      return this.$store.getters['users/userPostsCount'](this.post.userId)
    },
    userThreadsCount () {
      return this.$store.getters['users/userThreadsCount'](this.post.userId)
    }
  },

  methods: {
    cancel () {
      this.editing = false
    }
  }
}
</script>

<style>
</style>
