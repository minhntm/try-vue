import firebase from 'firebase'

export default {
  fetchResource ({state, commit}, {resourceName, id}) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(resourceName).child(id).once('value', snapshot => {
        commit('setResource', {
          id: snapshot.key,
          resource: snapshot.val(),
          resourceName: resourceName
        })
        resolve(state[resourceName].items[id])
      })
    })
  },

  fetchResources ({dispatch}, {resourceName, ids}) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchResource', {resourceName, id})))
  }
}
