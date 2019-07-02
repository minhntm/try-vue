<template>
  <div class="col-large push-top">
    <h1>{{thread.title}}</h1>
    <p>
      By <a href="#" class="link-unstyled">Robin</a>,
      <AppDate :timestamp="thread.publishedAt"/>
      <span style="float:right; margin-top: 2px;" class="hide-mobile text-faded text-small">
        {{repliesCount}} replies by {{usersCount}} contributors
      </span>
    </p>
    <PostList :posts="posts"/>
    <PostEditor
      @save="addPost"
      :threadId="id"
    />
  </div>
</template>

<script>
import sourceData from '@/data.json'
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
console.log(sourceData)

export default {
  components: {
    PostList,
    PostEditor
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  data () {
    return {
      thread: sourceData.threads[this.id]
    }
  },

  computed: {
    posts () {
      const postIds = Object.values(this.thread.posts)
      return Object.values(sourceData.posts)
        .filter(post => postIds.includes(post['.key']))
    },
    repliesCount () {
      return this.posts.length
    },
    usersCount () {
      const userIds = this.posts.map(post => post.userId)
      return Object.keys(sourceData.users)
        .filter(userId => userIds.includes(userId)).length
    }
  },

  methods: {
    addPost ({post}) {
      const postId = post['.key']
      this.$set(sourceData.posts, postId, post)
      this.$set(this.thread.posts, postId, postId)
      this.$set(sourceData.users[post.userId].posts, postId, postId)
    }
  }
}
</script>
