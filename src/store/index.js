import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data.json'
import { countObjectProperties } from '@/utils'

Vue.use(Vuex)

const appendChildToParentMutation = ({childName, parentName}) => {
  return (state, {childId, parentId}) => {
    const parent = state[parentName][parentId]
    if (!parent[childName]) {
      Vue.set(parent, childName, {})
    }
    Vue.set(parent[childName], childId, childId)
  }
}

export default new Vuex.Store({
  state: {
    ...sourceData,
    authId: '7uVPJS9GHoftN58Z2MXCYDqmNAh2'
  },

  getters: {
    authUser (state) {
      return state.users[state.authId]
    },

    userPostsCount: state => userId => countObjectProperties(state.users[userId].posts),
    userThreadsCount: state => userId => countObjectProperties(state.users[userId].threads),
    threadRepliesCount: state => threadId => (
      countObjectProperties(state.threads[threadId].posts) - 1
    )
  },

  actions: {
    createPost ({commit, state}, newPost) {
      const post = {...newPost}
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)

      commit('setPost', {post, postId})
      commit('appendPostToThread', {parentId: post.threadId, childId: postId})
      commit('appendPostToUser', {parentId: post.userId, childId: postId})

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
        commit('appendThreadToForum', {childId: threadId, parentId: forumId})
        commit('appendThreadToUser', {childId: threadId, parentId: userId})

        resolve(state.threads[threadId])
      })
    },

    updateThread ({commit, state, dispatch}, {id, text, title}) {
      return new Promise((resolve, reject) => {
        const thread = state.threads[id]
        const updatedThread = {...thread, title}

        commit('setThread', {thread: updatedThread, threadId: id})
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

    appendPostToThread: appendChildToParentMutation({
      childName: 'posts',
      parentName: 'threads'
    }),

    appendPostToUser: appendChildToParentMutation({
      childName: 'posts',
      parentName: 'users'
    }),

    appendThreadToForum: appendChildToParentMutation({
      childName: 'threads',
      parentName: 'forums'
    }),

    appendThreadToUser: appendChildToParentMutation({
      childName: 'threads',
      parentName: 'users'
    })
  }
})
