import Vue from 'vue'
import Vuex from 'vuex'
import shared from './modules/shared'
import user from './modules/user'
import signups from './modules/signups'
import messages from './modules/messages'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    shared,
    user,
    signups,
    messages,
  }
})