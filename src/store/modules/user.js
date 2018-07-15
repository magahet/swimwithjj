import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  state: {
    user: null,
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    initLogin({commit}) {
      firebase.auth().onAuthStateChanged(user => {
        if (!user) {
          commit('setUser', null)
          return
        }
        const newUser = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          photoUrl: user.photoURL
        }
        commit('setUser', newUser)
      })
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .catch(error => commit('setError', error))
        .finally(() => commit('setLoading', false))
    },
    logout () {
      firebase.auth().signOut()
    }
  },
  getters: {
    user: state => state.user,
  }
}