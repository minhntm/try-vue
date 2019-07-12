import Vue from 'vue'

const appendChildToParentMutation = ({childName, parentName}) => {
  return (state, {childId, parentId}) => {
    const parent = state[parentName][parentId]
    if (!parent[childName]) {
      Vue.set(parent, childName, {})
    }
    Vue.set(parent[childName], childId, childId)
  }
}

export default {
  setPost (state, {post, postId}) {
    Vue.set(state.posts, postId, post)
  },

  setThread (state, {thread, threadId}) {
    Vue.set(state.threads, threadId, thread)
  },

  setUser (state, {user, userId}) {
    Vue.set(state.users, userId, user)
  },

  setResource (state, {resource, id, resourceName}) {
    resource['.key'] = id
    Vue.set(state[resourceName], id, resource)
  },

  setAuthId (state, id) {
    state.authId = id
  },

  appendPostToThread: appendChildToParentMutation({
    childName: 'posts',
    parentName: 'threads'
  }),

  appendContributorToThread: appendChildToParentMutation({
    childName: 'contributors',
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
