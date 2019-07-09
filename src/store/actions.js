import firebase from 'firebase'

export default {
  createPost ({commit, state}, newPost) {
    const postId = firebase.database().ref('posts').push().key
    const post = {...newPost}
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`threads/${post.threadId}/contributors/${post.userId}`] = post.userId
    updates[`users/${post.userId}/posts/${postId}`] = postId
    firebase.database().ref().update(updates)
      .then(() => {
        commit('setResource', {resource: post, id: postId, resourceName: 'posts'})
        commit('appendPostToThread', {parentId: post.threadId, childId: postId})
        commit('appendContributorToThread', {parentId: post.threadId, childId: post.userId})
        commit('appendPostToUser', {parentId: post.userId, childId: postId})

        return Promise.resolve(state.posts[postId])
      })
  },

  createThread ({commit, state, dispatch}, {text, title, forumId}) {
    return new Promise((resolve, reject) => {
      const threadId = firebase.database().ref('threads').push().key
      const postId = firebase.database().ref('posts').push().key
      const publishedAt = Math.floor(Date.now() / 1000)
      const userId = state.authId
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
          commit('setResource', {id: threadId, resource: thread, resourceName: 'threads'})
          commit('appendThreadToForum', {childId: threadId, parentId: forumId})
          commit('appendThreadToUser', {childId: threadId, parentId: userId})

          commit('setResource', {resource: post, id: postId, resourceName: 'posts'})
          commit('appendPostToThread', {parentId: post.threadId, childId: postId})
          commit('appendPostToUser', {parentId: post.userId, childId: postId})

          resolve(state.threads[threadId])
        })
    })
  },

  updateThread ({commit, state, dispatch}, {id, text, title}) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updatedThread = {...thread, title, edited}
      const updates = {...updatedThread}
      delete updates['.key']

      firebase.database().ref('threads').child(id).update(updates)
        .then(() => {
          dispatch('updatePost', {id: thread.firstPostId, text: text})
            .then(() => {
              commit('setThread', {thread: updatedThread, threadId: id})
              resolve(updatedThread)
            })
        })
    })
  },

  updatePost ({commit, state}, {id, text}) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = {text, edited}
      firebase.database().ref('posts').child(id).update(updates)
        .then(() => {
          commit('setPost', {postId: id, post: {...post, text, edited}})
          resolve(post)
        })

      resolve(post)
    })
  },

  updateUser: ({commit}, user) => commit('setUser', {userId: user['.key'], user: { ...user }}),

  fetchResource ({state, commit}, {resourceName, id}) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(resourceName).child(id).once('value', snapshot => {
        commit('setResource', {
          id: snapshot.key,
          resource: snapshot.val(),
          resourceName: resourceName
        })
        resolve(state[resourceName][id])
      })
    })
  },

  fetchThread: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'threads', id: id}),
  fetchUser: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'users', id: id}),
  fetchPost: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'posts', id: id}),
  fetchCategory: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'categories', id: id}),
  fetchForum: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'forums', id: id}),

  fetchResources ({dispatch}, {resourceName, ids}) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchResource', {resourceName, id})))
  },

  fetchPosts: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'posts', ids}),
  fetchUsers: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'users', ids}),
  fetchThreads: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'threads', ids}),
  fetchForums: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'forums', ids: ids}),

  fetchAllCategories ({state, commit}) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('categories').once('value', snapshot => {
        const categoriesObject = snapshot.val()
        Object.keys(categoriesObject).forEach(categoryId => {
          const category = categoriesObject[categoryId]
          commit('setResource', {
            resource: category,
            id: categoryId,
            resourceName: 'categories'
          })
        })
        resolve(Object.values(state.categories))
      })
    })
  }
}
