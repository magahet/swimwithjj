<template>
<b-container fluid>
<b-row>
<b-col>
<h4>Waitlist</h4>

<b-table striped hover :items="waitlist" :fields="fields">
</b-table>

</b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  props: [
    'waitlist',
  ],
  data() {
    return {
      fields: [
        {
          key: 'created',
          label: 'Date/Time',
          formatter: 'tsToDate',
        },
        'name',
        'email',
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
    filteredMessages() {
      return Array.prototype.slice.call(this.waitlist).sort((a, b) => b.created.seconds - a.created.seconds)
    }
  },
}
</script>