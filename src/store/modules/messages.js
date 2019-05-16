import {firestore} from '@/db'

export default {
  state: {
    messages: [],
  },
  getters: {
    messages: state => state.messages,
  },
  mutations: {
    addMessage(state, message) {
      state.messages.push(message)
    },
    updateMessage(state, message) {
      const index = state.messages.findIndex(s => s.id == message.id)
      state.messages.splice(index, 1, message)
    },
    deleteMessage(state, id) {
      const index = state.messages.findIndex(s => s.id == id)
      if (index >= 0) {
        state.messages.splice(index, 1)
      }
    },
  },
  actions: {
    initMessages({commit}) {
      firestore.collection('messages').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'

            if (source === 'Server') {
              let message = change.doc.data()
              message.id = change.doc.id
              commit('addMessage', message)
            }
          }
          if (change.type === 'modified') {
              let message = change.doc.data()
              message.id = change.doc.id
            commit('updateMessage', message)
          }
          if (change.type === 'removed') {
            commit('deleteMessage', change.doc.id)
          }
        })
      })
    },
  },
}