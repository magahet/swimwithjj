<template>
<b-container fluid>
<b-row>
<b-col>
<h4>Waitlist</h4>

<b-form-group>
  <b-form-radio-group
          v-model="kind"
          :options="options"
          buttons
          button-variant="outline-primary"
        ></b-form-radio-group>
</b-form-group>

<div v-if="kind === 'table'">
  <b-form-input v-model="filter" placeholder="Type to Search"></b-form-input>
  <b-table striped hover :filter="filter" :items="waitlist" :fields="fields"></b-table>
</div>

<div v-if="kind === 'csv'">
  <pre>{{waitlistCSV}}</pre>
</div>

<div v-if="kind === 'list'">
  <span>{{waitlistList}}</span>
</div>

</b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  props: [
  ],
  data() {
    return {
      kind: 'table',
      options: ['table', 'csv', 'list'],
      filter: null,
      fields: [
        {
          key: 'created',
          label: 'Added',
          formatter: 'tsToDate',
          sortable: true,
        },
        {
          key: 'name',
          sortable: true,
        },
        {
          key: 'email',
          sortable: true,
        },
      ]
    }
  },
  methods: {
    tsToDate(ts) {
      let date = new Date(ts.seconds * 1000)
      return date.toLocaleString()
    },
  },
  computed: {
    waitlist() {
      return this.$store.getters.waitlist
    },
    waitlistCSV() {
      return this.waitlist.map(e => [e.name, e.email].join(', ')).join('\n')
    },
    waitlistList() {
      return this.waitlist.map(e => `"${e.name}" <${e.email}>`).join(', ')
    },
  },
  created() {
    this.$store.dispatch('initWaitlist')
  },
}
</script>