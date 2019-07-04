import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ...sourceData,
    authId: '7uVPJS9GHoftN58Z2MXCYDqmNAh2'
  },

  getters: {
    authUser (state) {
      return state.users[state.authId]
    }
  },

  actions: {
    createPost ({commit, state}, newPost) {
      const post = {...newPost}
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)

      commit('setPost', {post, postId})
      commit('appendPostToThread', {threadId: post.threadId, postId})
      commit('appendPostToUser', {userId: post.userId, postId})

      return Promise.resolve(state.posts[postId])
    },

    createThread ({commit, state, dispatch}, {text, title, forumId}) {
      return new Promise((resolve, reject) => {
        const threadId = 'greateThread' + Math.random()
        const publishedAt = Math.floor(Date.now() / 1000)
        const userId = state.authId
        const thread = {
          '.key': threadId,
          title,
          forumId,
          publishedAt,
          userId
        }

        commit('setThread', {threadId, thread})
        dispatch('createPost', {text, threadId})
          .then(post => {
            commit('setThread', {threadId, thread: {...thread, firstPostId: post['.key']}})
          })
        commit('appendThreadToForum', {threadId, forumId})
        commit('appendThreadToUser', {threadId, userId})

        resolve(state.threads[threadId])
      })
    },

    updateThread ({commit, state, dispatch}, {id, text, title}) {
      return new Promise((resolve, reject) => {
        const thread = state.threads[id]
        // const post = state.posts[thread.firstPostId]

        const updatedThread = {...thread, title}
        // const updatedPost = {...post, text}
        commit('setThread', {thread: updatedThread, threadId: id})
        // commit('setPost', {post: updatedPost, postId: thread.firstPostId})

        dispatch('updatePost', {id: thread.firstPostId, text})
          .then(() => {
            resolve(updatedThread)
          })
      })
    },

    updatePost ({commit, state}, {id, text}) {
      return new Promise((resolve, reject) => {
        const post = state.posts[id]
        commit('setPost', {
          postId: id,
          post: {
            ...post,
            text,
            edited: {
              at: Math.floor(Date.now() / 1000),
              by: state.authId
            }
          }
        })
        resolve(post)
      })
    },

    updateUser ({commit}, user) {
      commit('setUser', {userId: user['.key'], user: { ...user }})
    }
  },

  mutations: {
    setPost (state, {post, postId}) {
      Vue.set(state.posts, postId, post)
    },

    setThread (state, {thread, threadId}) {
      Vue.set(state.threads, threadId, thread)
    },

    setUser (state, {user, userId}) {
      Vue.set(state.users, userId, user)
    },

    appendPostToThread (state, {postId, threadId}) {
      const thread = state.threads[threadId]
      if (!thread.posts) {
        Vue.set(thread, 'posts', {})
      }
      Vue.set(thread.posts, postId, postId)
    },

    appendPostToUser (state, {postId, userId}) {
      const user = state.users[userId]
      if (!user.posts) {
        Vue.set(user, 'posts', {})
      }
      Vue.set(user.posts, postId, postId)
    },

    appendThreadToForum (state, {threadId, forumId}) {
      const forum = state.forums[forumId]
      if (!forum.threads) {
        Vue.set(forum, 'threads', {})
      }
      Vue.set(forum.threads, threadId, threadId)
    },

    appendThreadToUser (state, {threadId, userId}) {
      const user = state.users[userId]
      if (!user.threads) {
        Vue.set(user, 'threads', {})
      }
      Vue.set(user.threads, threadId, threadId)
    }
  }
})
