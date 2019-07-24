import firebase from 'firebase'
import Vue from 'vue'
import {appendChildToParentMutation} from '../assetHelpers'
import {countObjectProperties, removeEmptyProperties} from '@/utils'

export default {
  namespaced: true,

  state: {
    items: {}
  },

  getters: {
    userPosts: (state, getters, rootState) => id => {
      const user = state.items[id]
      if (user.posts) {
        return Object.values(rootState.posts.items)
          .filter(post => post.userId === id)
      }
      return []
    },

    userPostsCount: state => userId => countObjectProperties(state.items[userId].posts),
    userThreadsCount: state => userId => countObjectProperties(state.items[userId].threads)
  },

  actions: {
    createUser ({state, commit}, {id, email, name, username, avatar = null}) {
      return new Promise((resolve, reject) => {
        const registeredAt = Math.floor(Date.now() / 1000)
        const usernameLower = username.toLowerCase()
        email = email.toLowerCase()
        const user = {avatar, email, name, username, usernameLower, registeredAt}
        firebase.database().ref('users').child(id).set(user)
          .then(() => {
            commit('setResource', {resourceName: 'users', id: id, resource: user}, {root: true})
            resolve(state.items[id])
          })
      })
    },

    updateUser: ({commit}, user) => {
      const updates = {
        avatar: user.avatar,
        username: user.username,
        name: user.name,
        bio: user.bio,
        website: user.website,
        email: user.email,
        location: user.location
      }
      return new Promise((resolve, reject) => {
        firebase.database().ref('users').child(user['.key']).update(removeEmptyProperties(updates))
          .then(() => {
            commit('setUser', {userId: user['.key'], user: { ...user }})
            resolve(user)
          })
      })
    },
    fetchUser: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'users', id: id}, {root: true}),
    fetchUsers: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'users', ids}, {root: true})
  },

  mutations: {
    setUser (state, {user, userId}) {
      Vue.set(state.items, userId, user)
    },

    appendPostToUser: appendChildToParentMutation({
      childName: 'posts',
      parentName: 'users'
    }),

    appendThreadToUser: appendChildToParentMutation({
      childName: 'threads',
      parentName: 'users'
    })
  }
}
