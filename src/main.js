// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import firebase from 'firebase'
import App from './App'
import router from './router'
import store from '@/store'
import AppDate from '@/components/AppDate'

Vue.component('AppDate', AppDate)
Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: 'AIzaSyAVOw-skFwHjRCSkKwWhuT_KDZRb4C7x5A',
  authDomain: 'try-vue-ef2c1.firebaseapp.com',
  databaseURL: 'https://try-vue-ef2c1.firebaseio.com',
  projectId: 'try-vue-ef2c1',
  storageBucket: '',
  messagingSenderId: '536056890948',
  appId: '1:536056890948:web:5bc0052aa26b387d'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  beforeCreate () {
    store.dispatch('fetchUser', {id: store.state.authId})
  }
})
