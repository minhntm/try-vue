<template>
  <div class="flex-grid">
    <UserProfileCard
      v-if="!edit"
      :user="user"
    />
    <UserProfileCardEditor
      v-else
      :user="user"
    />
    <div class="col-7 push-top">

      <div class="profile-header">
        <span class="text-lead">
            {{user.name}}'s recent activity
        </span>
        <a href="#">See only started threads?</a>
      </div>

      <hr>
      <PostList :posts="userPosts"/>
    </div>
  </div>
</template>

<script>
import UserProfileCard from '@/components/UserProfileCard'
import UserProfileCardEditor from '@/components/UserProfileCardEditor'
import PostList from '@/components/PostList'
import {mapGetters} from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  components: {
    UserProfileCard,
    UserProfileCardEditor,
    PostList
  },

  props: {
    edit: {
      type: Boolean,
      default: false
    }
  },

  mixins: [asyncDataStatus],

  computed: {
    ...mapGetters({
      user: 'auth/authUser',
      getUserPosts: 'users/userPosts'
    }),
    userPosts () {
      return this.getUserPosts(this.user['.key'])
    }
  },

  created () {
    this.$store.dispatch('posts/fetchPosts', {ids: this.user.posts})
      .then(() => this.asyncDataStatus_fetched())
  },

  updated () {
    this.$store.dispatch('posts/fetchPosts', {ids: this.user.posts})
      .then(() => this.asyncDataStatus_fetched())
  }
}
</script>

<style>
</style>
