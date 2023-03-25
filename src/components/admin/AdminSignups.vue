<template>
  <b-container fluid>
    <b-row no-gutters>
      <b-col>
        <h4>Signups <b-badge pill variant="primary"
            @click="statusFilter = 'signup received'" href="#">{{ newSignups }}
          </b-badge>
        </h4>

        <b-link v-show="!filterBarOpen" @click="filterBarOpen = true">show
          filters</b-link>
        <b-link v-show="filterBarOpen" @click="filterBarOpen = false">hide
          filters</b-link>
        <span v-show="filtersOn"> | <b-link @click="clearFilters">clear filters
          </b-link></span>

        <div v-show="filterBarOpen">

          <b-form class="m-3">
            <b-form-row>
              <b-col>
                <b-form-group label="Search">
                  <b-input v-model="searchTerm"></b-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Status">
                  <b-form-select v-model="statusFilter" :options="statusList">
                    <template slot="first">
                      <!-- this slot appears above the options from 'options' prop -->
                      <option value="All">All</option>
                    </template>
                  </b-form-select>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Sessions">
                  <b-form-radio-group buttons v-model="sessionFilter"
                    :options="sessionList">
                    <template slot="first">
                      <!-- this slot appears above the options from 'options' prop -->
                      <b-form-radio value="All">All</b-form-radio>
                    </template>
                  </b-form-radio-group>
                </b-form-group>
              </b-col>
            </b-form-row>
          </b-form>
        </div>

        <b-list-group class="list-group-flush">
          <b-list-group-item v-for="signup in filteredSignups" :key="signup.id">
            <b-container fluid>
              <b-row no-gutters>

                <b-col md="4">
                  <signup-info :signup="signup" :status-list="statusList">
                  </signup-info>
                </b-col>

                <b-col v-for="(child, childIdx) in signup.children"
                  :key="childIdx">
                  <b-container fluid class="child-container">
                    <b-row no-gutters>
                      <b-col cols="9" class="mr-2">

                        <div>
                          <span class="font-weight-bold">{{ child.name }}</span>
                          <span class="ml-4">{{ child.birthday }} ({{
                              child.birthday | age
                          }})</span>
                        </div>

                        <div>
                          {{ child.level }}
                        </div>

                      </b-col>
                      <b-col>
                        <span
                          class="font-weight-bold font-italic">sessions</span>
                        <ul class="list-unstyled">
                          <li v-for="(session, sessionIdx) in child.sessions"
                            :key="session.id">
                            <session :session="session" :signup-id="signup.id"
                              :child-idx="childIdx" :session-idx="sessionIdx">
                            </session>
                          </li>
                        </ul>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-col>

              </b-row>
            </b-container>
          </b-list-group-item>
        </b-list-group>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import SignupInfo from '@/components/admin/SignupInfo.vue'
import Session from '@/components/admin/Session.vue'
import moment from 'moment'


function getNested(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}

export default {
  components: {
    SignupInfo,
    Session,
  },
  props: [
  ],
  data() {
    return {
      filterBarOpen: false,
      searchTerm: '',
      statusFilter: 'All',
      sessionFilter: 'All',
      sortBy: 'created.seconds',
      statusList: [
        'signup received',
        'lessons scheduled',
      ],
    }
  },
  methods: {
    childNames(children) {
      return children.map(child => child.name).join(', ')
    },
    clearFilters() {
      this.searchTerm = ''
      this.statusFilter = 'All'
      this.sessionFilter = 'All'
    },
  },
  computed: {
    signups() {
      return this.$store.getters.signups
    },
    newSignups() {
      return this.signups.reduce((total, signup) => {
        let v = signup.status != 'signup received' ? 0 : 1
        return total + v
      }, 0)
    },
    sessionList() {
      let sessions = this.signups.flatMap(signup => signup.children.flatMap(child => child.sessions.flatMap(session => session.id)))
      sessions.sort((a, b) => a - b)
      return [...new Set(sessions)]
    },
    filteredSignups() {
      return this.signups.filter(signup => {
        return this.statusFilter == 'All' || this.statusFilter == signup.status
      }).filter(signup => {
        return this.sessionFilter == 'All' || signup.children.some(child => {
          return child.sessions.some(session => session.id == this.sessionFilter)
        })
      }).filter(signup => {
        if (this.searchTerm == '') {
          return true
        }
        return JSON.stringify(signup).toLowerCase().search(this.searchTerm.toLowerCase()) != -1
      }).sort((a, b) => {
        return getNested(b, this.sortBy) - getNested(a, this.sortBy)
      })
    },
    filtersOn() {
      return this.searchTerm != '' || this.statusFilter != 'All' || this.sessionFilter != 'All'
    },
  },
  created() {
    this.$store.dispatch('initSignups')
  },
  filters: {
    age(birthday) {
      let age = moment.duration(moment() - moment(birthday))
      return `${age.years()}y ${age.months()}m`
    },
  },
}
</script>

<style scoped>
.child-container:nth-child(even) {
  background-color: azure;
}
</style>