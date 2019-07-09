import firebase from 'firebase'

export default {
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
        .then(() => resolve(updatedThread))
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
