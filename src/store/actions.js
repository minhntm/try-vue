import firebase from 'firebase'
import {removeEmptyProperties} from '@/utils'

export default {
  initAuthentication ({dispatch, commit, state}) {
    return new Promise((resolve, reject) => {
      if (state.unsubscribeAuthObserver) {
        state.unsubscribeAuthObserver()
      }
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        console.log('the user has changed')
        if (user) {
          dispatch('fetchAuthUser')
            .then(dbUser => resolve(dbUser))
        } else {
          resolve(null)
        }
      })
      commit('setUnsubscribeAuthObserver', unsubscribe)
    })
  },

  fetchAuthUser ({dispatch, commit}) {
    const userId = firebase.auth().currentUser.uid
    return new Promise((resolve, reject) => {
      firebase.database().ref('users').child(userId).once('value', snapshot => {
        if (snapshot.exists()) {
          return dispatch('fetchUser', {id: userId})
            .then(user => {
              commit('setAuthId', userId)
              resolve(user)
            })
        } else {
          resolve(null)
        }
      })
    })
  },

  signInWithEmailAndPassword (context, {email, password}) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  },

  signInWithGoogle ({dispatch}) {
    const provider = new firebase.auth.GoogleAuthProvider()
    return firebase.auth().signInWithPopup(provider)
      .then(data => {
        const user = data.user
        firebase.database().ref('users').child(user.uid).once('value', snapshot => {
          if (!snapshot.exists()) {
            return dispatch('createUser', {id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL})
              .then(() => dispatch('fetchAuthUser'))
          }
        })
      })
  },

  signOut ({commit}) {
    return firebase.auth().signOut()
      .then(() => {
        commit('setAuthId', null)
      })
  },

  registerUserWithEmailAndPassword ({dispatch}, {email, name, username, password, avatar = null}) {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(auth => dispatch('createUser', {id: auth.user.uid, email, name, username, password, avatar}))
      .then(() => dispatch('fetchAuthUser'))
  },

  createUser ({state, commit}, {id, email, name, username, avatar = null}) {
    return new Promise((resolve, reject) => {
      const registeredAt = Math.floor(Date.now() / 1000)
      const usernameLower = username.toLowerCase()
      email = email.toLowerCase()
      const user = {avatar, email, name, username, usernameLower, registeredAt}
      firebase.database().ref('users').child(id).set(user)
        .then(() => {
          commit('setResource', {resourceName: 'users', id: id, resource: user})
          resolve(state.users[id])
        })
    })
  },

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
