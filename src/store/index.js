import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    categories: {},
    forums: {},
    threads: {},
    posts: {},
    users: {},
    authId: '7uVPJS9GHoftN58Z2MXCYDqmNAh2'
  },

  getters,
  actions,
  mutations
})
