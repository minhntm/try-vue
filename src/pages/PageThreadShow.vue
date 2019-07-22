<template>
  <div v-if="asyncDataStatus_ready" class="col-large push-top">
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
    <router-link :to="{name: 'ThreadShow', params: {id: '-KvcwywxaxxIfsHR88wa'}}">adf</router-link>
    <PostList :posts="posts"/>
    <PostEditor
      v-if="authUser"
      :threadId="id"
    />
    <div v-else class="text-center" style="margin-bottom: 50px;">
      <router-link :to="{name: 'SignIn', query: {redirectTo: $route.path}}">Sign in</router-link> or
      <router-link :to="{name: 'Register'}">Register</router-link> to post a reply
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import {countObjectProperties} from '@/utils'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  components: {
    PostList,
    PostEditor
  },

  mixins: [asyncDataStatus],

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
    },
    ...mapGetters(['authUser'])
  },

  methods: {
    ...mapActions(['fetchThread', 'fetchUser', 'fetchPosts'])
  },

  created () {
    this.fetchThread({id: this.id})
      .then(thread => {
        this.fetchUser({id: thread.userId})
        return this.fetchPosts({ids: Object.keys(thread.posts)})
      })
      .then(posts => Promise.all(posts.map(post => this.fetchUser({id: post.userId}))))
      .then(() => this.asyncDataStatus_fetched())
  },

  updated () {
    this.fetchThread({id: this.id})
      .then(thread => {
        this.fetchUser({id: thread.userId})
        return this.fetchPosts({ids: Object.keys(thread.posts)})
      })
      .then(posts => Promise.all(posts.map(post => this.fetchUser({id: post.userId}))))
      .then(() => this.asyncDataStatus_fetched())
  }
}
</script>
