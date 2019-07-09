<template>
  <div v-if="thread && text" class="col-full push-top">

    <h1>Editing <i>{{title}}</i></h1>

    <ThreadEditor
      :title="title"
      :text="text"
      @save="save"
      @cancel="cancel"
    />
  </div>
</template>

<script>
import ThreadEditor from '@/components/ThreadEditor'
export default {
  components: {
    ThreadEditor
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  computed: {
    thread () {
      return this.$store.state.threads[this.id]
    },

    title () {
      return this.thread.title
    },

    text () {
      const post = this.$store.state.posts[this.thread.firstPostId]
      return post ? post.text : null
    }
  },

  methods: {
    save ({title, text}) {
      this.$store.dispatch('updateThread', {
        id: this.id,
        text,
        title
      }).then(thread => {
        this.$router.push({name: 'ThreadShow', params: {id: this.id}})
      })
    },

    cancel () {
      this.$router.push({name: 'ThreadShow', params: {id: this.id}})
    }
  },

  created () {
    this.$store.dispatch('fetchThread', {id: this.id})
      .then(thread => {
        this.$store.dispatch('fetchPost', {id: thread.firstPostId})
      })
  }
}
</script>

<style>
</style>
