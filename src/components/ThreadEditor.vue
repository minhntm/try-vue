<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <label for="thread_title">Title:</label>
      <input
        v-model="form.title"
        @blur="$v.form.title.$touch()"
        type="text" id="thread_title" class="form-input" name="title">
      <template v-if="$v.form.title.$error">
        <span v-if="!$v.form.title.required" class="form-error">This field is required</span>
        <span v-else-if="!$v.form.title.minLength" class="form-error">At least 10 characters is required</span>
      </template>
    </div>

    <div class="form-group">
      <label for="thread_content">Content:</label>
      <textarea
        v-model="form.text"
        @blur="$v.form.text.$touch()"
        id="thread_content" class="form-input" name="content" rows="8" cols="140"></textarea>
      <template v-if="$v.form.text.$error">
        <span v-if="!$v.form.text.required" class="form-error">This field is required</span>
        <span v-else-if="!$v.form.text.minLength" class="form-error">At least 10 characters is required</span>
      </template>
    </div>

    <div class="btn-group">
      <button @click.prevent="cancel" class="btn btn-ghost">Cancel</button>
      <button @click.prevent="save" class="btn btn-blue" type="submit" name="Publish">Publish </button>
    </div>
  </form>
</template>

<script>
import {required, minLength} from 'vuelidate/lib/validators'
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      form: {
        text: this.text,
        title: this.title
      }
    }
  },

  validations: {
    form: {
      title: {
        required,
        minLength: minLength(10)
      },
      text: {
        required,
        minLength: minLength(10)
      }
    }
  },

  methods: {
    save () {
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        return
      }
      this.$emit('save', {title: this.form.title, text: this.form.text})
    },

    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style>
</style>
