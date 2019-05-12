import {firestore} from '@/db'

export default {
  state: {
    signups: [],
  },
  getters: {
    signups: state => state.signups,
  },
  mutations: {
    addSignup(state, signup) {
      state.signups.push(signup)
    },
    updateSignup(state, signup) {
      const index = state.signups.findIndex(s => s.id == signup.id)
      state.signups.splice(index, 1, signup)
    },
    deleteSignup(state, id) {
      const index = state.signups.findIndex(s => s.id == id)
      if (index >= 0) {
        state.signups.splice(index, 1)
      }
    },
  },
  actions: {
    initSignups({commit}) {
      firestore.collection('signups').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'

            if (source === 'Server') {
              let signup = change.doc.data()
              signup.id = change.doc.id
              commit('addSignup', signup)
            }
          }
          if (change.type === 'modified') {
              let signup = change.doc.data()
              signup.id = change.doc.id
            commit('updateSignup', signup)
          }
          if (change.type === 'removed') {
            commit('deleteSignup', change.doc.id)
          }
        })
      })
    },
  },
}