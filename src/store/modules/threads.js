import {countObjectProperties} from '@/utils'
import firebase from 'firebase'
import Vue from 'vue'
import {appendChildToParentMutation} from '../assetHelpers'

export default {
  namespaced: true,

  state: {
    items: {}
  },

  getters: {
    threadRepliesCount: state => threadId => countObjectProperties(state.items[threadId].posts) - 1
  },

  actions: {
    createThread ({commit, state, dispatch, rootState}, {text, title, forumId}) {
      return new Promise((resolve, reject) => {
        const threadId = firebase.database().ref('threads').push().key
        const postId = firebase.database().ref('posts').push().key
        const publishedAt = Math.floor(Date.now() / 1000)
        const userId = rootState.auth.authId
        const thread = {title, forumId, publishedAt, userId, posts: {}}
        thread.posts[postId] = postId
        thread.firstPostId = postId
        const post = {text, publishedAt, threadId, userId}

        const updates = {}
        updates[`threads/${threadId}`] = thread
        updates[`forums/${forumId}/threads/${threadId}`] = threadId
        updates[`users/${userId}/threads/${threadId}`] = threadId

        updates[`posts/${postId}`] = post
        updates[`users/${userId}/posts/${postId}`] = postId

        firebase.database().ref().update(updates)
          .then(() => {
            commit('setResource', {id: threadId, resource: thread, resourceName: 'threads'}, {root: true})
            commit('forums/appendThreadToForum', {childId: threadId, parentId: forumId}, {root: true})
            commit('users/appendThreadToUser', {childId: threadId, parentId: userId}, {root: true})

            commit('setResource', {resource: post, id: postId, resourceName: 'posts'}, {root: true})
            commit('appendPostToThread', {parentId: post.threadId, childId: postId})
            commit('users/appendPostToUser', {parentId: post.userId, childId: postId}, {root: true})

            resolve(state.items[threadId])
          })
      })
    },

    updateThread ({commit, state, dispatch, rootState}, {id, text, title}) {
      return new Promise((resolve, reject) => {
        const thread = state.items[id]
        const edited = {
          at: Math.floor(Date.now() / 1000),
          by: rootState.auth.authId
        }

        const updatedThread = {...thread, title, edited}
        const updates = {...updatedThread}
        delete updates['.key']

        firebase.database().ref('threads').child(id).update(updates)
          .then(() => {
            dispatch('posts/updatePost', {id: thread.firstPostId, text: text}, {root: true})
              .then(() => {
                commit('setThread', {thread: updatedThread, threadId: id})
                resolve(updatedThread)
              })
          })
      })
    },

    fetchThread: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'threads', id: id}, {root: true}),
    fetchThreads: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'threads', ids}, {root: true})

  },

  mutations: {
    setThread (state, {thread, threadId}) {
      Vue.set(state.items, threadId, thread)
    },

    appendPostToThread: appendChildToParentMutation({
      childName: 'posts',
      parentName: 'threads'
    }),

    appendContributorToThread: appendChildToParentMutation({
      childName: 'contributors',
      parentName: 'threads'
    })
  }
}
