<template>
<div class="flex-grid justify-center">
  <div class="col-2">

    <form @submit.prevent="signIn" action="" class="card card-form">
      <h1 class="text-center">Login</h1>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          v-model="form.email"
          @blur="$v.form.email.$touch()"
          id="email" type="text" class="form-input">
        <template v-if="$v.form.email.$error">
          <span v-if="!$v.form.email.required" class="form-error">This field is required</span>
          <span v-if="!$v.form.email.email" class="form-error">Please input your email</span>
        </template>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          v-model="form.password"
          @blur="$v.form.password.$touch()"
          id="password" type="password" class="form-input">
        <template v-if="$v.form.password.$error">
          <span v-if="!$v.form.password.required" class="form-error">This field is required</span>
        </template>
      </div>

      <div class="push-top">
        <button type="submit" class="btn-blue btn-block">Log in</button>
      </div>

      <div class="form-actions text-right">
        <router-link :to="{name: 'Register'}">
          Create an account?
        </router-link>
      </div>
    </form>

    <div class="push-top text-center">
      <button @click.prevent='signInWithGoogle' class="btn-red btn-xsmall"><i class="fa fa-google fa-btn"></i>Sign in with Google</button>
    </div>
  </div>
</div>
</template>

<script>
import {required, email} from 'vuelidate/lib/validators'
export default {
  data () {
    return {
      form: {
        email: null,
        password: null
      }
    }
  },

  validations: {
    form: {
      email: {
        required,
        email
      },
      password: {
        required
      }
    }
  },

  methods: {
    signIn () {
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        return
      }

      this.$store.dispatch('auth/signInWithEmailAndPassword', {
        email: this.form.email,
        password: this.form.password
      })
        .then(() => this.successRedirect())
        .catch(err => alert(err.message))
    },

    signInWithGoogle () {
      this.$store.dispatch('auth/signInWithGoogle')
        .then(() => this.successRedirect())
        .catch(err => alert(err.message))
    },
    successRedirect () {
      // route !== router
      const redirectTo = this.$route.query.redirectTo || {name: 'Home'}
      this.$router.push(redirectTo)
    }
  },

  created () {
    this.$emit('ready')
  }
}
</script>

<style>

</style>
