<template>
  <div v-if="thread && user" class="col-large push-top">
    <h1>{{thread.title}}</h1>
    <p>
      By <a href="#" class="link-unstyled">{{user.name}}</a>,
      <AppDate :timestamp="thread.publishedAt"/>
      <span style="float:right; margin-top: 2px;" class="hide-mobile text-faded text-small">
        {{repliesCount}} replies by {{contributorsCount}} contributors
      </span>
    </p>
    <router-link :to="{name:'ThreadEdit', params: {id: thread['.key']}}">
      Edit
    </router-link>
    <PostList :posts="posts"/>
    <PostEditor
      :threadId="id"
    />
  </div>
</template>

<script>
import {mapActions} from 'vuex'
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import {countObjectProperties} from '@/utils'

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

  computed: {
    thread () {
      return this.$store.state.threads[this.id]
    },
    posts () {
      const postIds = Object.values(this.thread.posts)
      return Object.values(this.$store.state.posts)
        .filter(post => postIds.includes(post['.key']))
    },
    repliesCount () {
      return this.posts.length - 1
    },
    contributorsCount () {
      return countObjectProperties(this.thread.contributors)
    },
    user () {
      return this.$store.state.users[this.thread.userId]
    }
  },

  methods: {
    ...mapActions(['fetchThread', 'fetchUser', 'fetchPosts'])
  },

  created () {
    this.fetchThread({id: this.id})
      .then(thread => {
        this.fetchUser({id: thread.userId})
        this.fetchPosts({ids: Object.keys(thread.posts)})
          .then(posts => {
            posts.forEach(post => {
              this.fetchUser({id: post.userId})
            })
          })
      })
  }
}
</script>
