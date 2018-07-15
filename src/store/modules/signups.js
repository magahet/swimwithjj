import {firestore, ts} from '@/db'

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
    initSignups(context) {
      firestore.collection('signups').onSnapshot(snapshot => {
        snapshot.docChanges(change => {
          if (change.type === 'added') {
            const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'

            if (source === 'Server') {
              context.commit('addSignup', change.doc.data())
            }
          }
          if (change.type === 'modified') {
            context.commit('updateSignup', change.doc.data())
          }
          if (change.type === 'removed') {
            context.commit('deleteTodo', change.doc.id)
          }
        })
      })
    },
    addSignup(context, signup) {
      signup.ts = ts()
      firestore.collection('signup').add(signup)
    },
  },
}