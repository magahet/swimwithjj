<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <h4>Signups</h4>
        <b-card class="my-2" v-for="(signup, sinupIndex) in signups" :key="sinupIndex">
          <b-container fluid>
            <b-row>
              <b-col>
                <span class="font-weight-bold">Status:</span> {{ signup.status }}
              </b-col>
              <b-col>
                <span class="font-weight-bold">Signup Date:</span> {{ tsToDate(signup.created) }}
              </b-col>
              <b-col>
                <span class="font-weight-bold">Parent:</span> {{ signup.parent.name }}
              </b-col>
              <b-col>
                <span class="font-weight-bold">Children:</span> {{ childNames(signup.children) }}
              </b-col>
            </b-row>
          </b-container>
        </b-card>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  props: [
    'signups',
  ],
  methods: {
    tsToDate(ts) {
      let date = new Date(ts.seconds * 1000)
      return date.toLocaleString()
    },
    childNames(children) {
      return children.map(child => child.name).join(', ')
    }
  },
}
</script>
