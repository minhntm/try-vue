<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        class="form-input"
        v-model="text">
      </textarea>
    </div>
    <div class="form-actions">
      <button v-if="isUpdate" class="btn btn-ghost" @click.prevent="cancel">
        Cancel
      </button>
      <button class="btn-blue">{{isUpdate ? 'Update' : 'Submit'}}</button>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    threadId: {
      required: false
    },
    post: {
      type: Object,
      validator: obj => {
        const keyIsValid = typeof obj['.key'] === 'string'
        const textIsValid = typeof obj.text === 'string' && obj.text
        const valid = keyIsValid && textIsValid
        if (!textIsValid) {
          console.error('Prop must include a not empty `text` attribute')
        }
        if (!keyIsValid) {
          console.error('Prop must include `key` attribute')
        }
        return valid
      }
    }
  },

  data () {
    return {
      text: this.post ? this.post.text : ''
    }
  },

  computed: {
    isUpdate () {
      return !!this.post
    }
  },

  methods: {
    save () {
      (this.isUpdate ? this.update() : this.create())
        .then(post => {
          this.$emit('save', {post})
        })
    },

    create () {
      const post = {
        text: this.text,
        threadId: this.threadId
      }
      this.text = ''

      return this.$store.dispatch('createPost', post)
    },

    update () {
      return this.$store.dispatch('updatePost', {
        id: this.post['.key'],
        text: this.text
      })
    },

    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style>
</style>
