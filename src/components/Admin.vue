<template>
<div>

<!-- Sign In -->
<div class="m-3" v-if="authUser == null">
  <h2>SwimWithJJ Admin Sign in</h2>
  <b-form inline @submit.prevent="signIn" class="p-3">
    <b-input name="email" class="mr-2" type="email" v-model="signin.email" placeholder="Email"></b-input>
    <b-input name="password" class="mr-2" type="password" v-model="signin.password" placeholder="Password"></b-input>
    <b-btn type="submit">Sign In</b-btn>
  </b-form>
</div>

<div v-if="authUser != null">

  <div class="grid-container">

    <div class="sidebar bg-dark" :class="{'collapsed': isCollapsed}">
      <div>
        <a href="#" class="btn-expand-collapse text-light"
            @click.prevent="isCollapsed = !isCollapsed">
          <i class="fas" :class="{'fa-angle-left': !isCollapsed, 'fa-angle-right': isCollapsed}"></i>
        </a>

        <b-nav vertical>
          <b-nav-item class="text-light" :active="page == 'signups'" @click="page = 'signups'">
            <i class="fas fa-swimmer"></i><span v-show="!isCollapsed" class="ml-2">Sign Ups</span>
          </b-nav-item>
          <b-nav-item class="text-light" :active="page == 'messages'" @click="page = 'messages'">
            <i class="fas fa-envelope"></i><span v-show="!isCollapsed" class="ml-2">Messages</span>
          </b-nav-item>
          <b-nav-item class="text-light" :active="page == 'waitlist'" @click="page = 'waitlist'">
            <i class="fas fa-clipboard-list"></i><span v-show="!isCollapsed" class="ml-2">Waitlist</span>
          </b-nav-item>
          <b-nav-item class="text-light" :active="page == 'settings'" @click="page = 'settings'">
            <i class="fas fa-cog"></i><span v-if="!isCollapsed" class="ml-2">Settings</span>
          </b-nav-item>
        </b-nav>
      </div>
    </div>

    <div class="main-content">
        <b-navbar type="dark" variant="primary">
          <b-navbar-brand>SwimWithJJ Admin</b-navbar-brand>

          <b-navbar-nav>
            <b-nav-text>{{authUser.email}}</b-nav-text>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item @click="signOut">Sign out</b-nav-item>
          </b-navbar-nav>
        </b-navbar>

        <admin-signups v-show="page == 'signups'"></admin-signups>
        <admin-messages :messages="messages" v-show="page == 'messages'"></admin-messages>
        <admin-waitlist :waitlist="waitlist" v-show="page == 'waitlist'"></admin-waitlist>
        <admin-settings :settings="settings" v-show="page == 'settings'"></admin-settings>

    </div>

  </div>

</div>

</div>
</template>

<script>

import '@/assets/loading.css'
import '@/assets/loading-btn.css'
import axios from "axios";

// import fb from "@/components/shared/firebaseInit"

import AdminSignups from '@/components/admin/AdminSignups'
import AdminMessages from '@/components/admin/AdminMessages'
import AdminWaitlist from '@/components/admin/AdminWaitlist'
import AdminSettings from '@/components/admin/AdminSettings'

export default {
  components: {
    AdminSignups,
    AdminMessages,
    AdminWaitlist,
    AdminSettings,
  },
  data() {
    return {
      settings: null,
      error: null,
      isCollapsed: false,
      page: 'signups',
      signin: {
        email: '',
        password: '',
      },
      signups: [],
      messages: [],
      waitlist: [],
      signupFields: [
        {
          key: 'created',
          sortable: true,
        },
        'parent',
        {
          key: 'children',

        },
      ],
    }
  },
  computed: {
    authUser() {
      return this.$store.getters.user
    },
  },
  methods: {
    signOut () {
      this.$store.dispatch('logout')
    },
    signIn () {
      this.$store.dispatch('signUserIn', this.signin).finally(() => {
        this.signin = {
          email: '',
          password: '',
        }
      })
    },
    tsToDate(ts) {
      return new Date(ts.seconds * 1000)
    },
  },
  created () {
    this.$store.dispatch('initLogin')
    axios
      .get(process.env.VUE_APP_SETTINGS_URL)
      .then(response => {
        this.settings = response.data
    })
      .catch(error => {
        this.error = error.message
    })
  }
}
</script>

<style>
.grid-container {
  height: 100vh;
  width: 100vw;
  display: grid;

  grid-template-areas:
    "sidebar content";

  grid-template-columns: max-content 1fr;

  justify-content: stretch;

}

.navbar {
  grid-area: navbar;
}

.sidebar {
  grid-area: sidebar;
}

.sidebar > div {
  position: sticky;
  top: 0;
}

.btn-expand-collapse {
  display: block;
  width: 100%;
  font-size: 24px;
  text-align: center;
}

.main-content {
  grid-area: content;
}

.nav-item.text-light > a {
  color: #f8f9fa;
}

.nav-item.text-light > a:hover {
  color: #dae0e5;
}

.nav-item.text-light > .active {
  background: #202429;
}

</style>
