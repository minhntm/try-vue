import firebase from 'firebase'

export default {
  namespaced: true,

  state: {
    items: {}
  },

  getters: {
  },

  actions: {
    fetchCategory: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'categories', id: id}, {root: true}),
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
            }, {root: true})
          })
          resolve(Object.values(state.items))
        })
      })
    }
  },

  mutations: {
  }
}
