import {firestore} from '@/db'

export default {
  state: {
    waitlist: [],
  },
  getters: {
    waitlist: state => state.waitlist,
  },
  mutations: {
    addEntry(state, entry) {
      state.waitlist.push(entry)
    },
    updateEntry(state, entry) {
      const index = state.waitlist.findIndex(s => s.id == entry.id)
      state.waitlist.splice(index, 1, entry)
    },
    deleteEntry(state, id) {
      const index = state.waitlist.findIndex(s => s.id == id)
      if (index >= 0) {
        state.waitlist.splice(index, 1)
      }
    },
  },
  actions: {
    initWaitlist({commit}) {
      firestore.collection('waitlist').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'

            if (source === 'Server') {
              let waitlist = change.doc.data()
              waitlist.id = change.doc.id
              commit('addEntry', waitlist)
            }
          }
          if (change.type === 'modified') {
              let waitlist = change.doc.data()
              waitlist.id = change.doc.id
            commit('updateEntry', waitlist)
          }
          if (change.type === 'removed') {
            commit('deleteEntry', change.doc.id)
          }
        })
      })
    },
  },
}