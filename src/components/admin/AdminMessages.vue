<template>
<b-container fluid>
<b-row>
<b-col>

<h4>Messages</h4>
<b-list-group>
  <b-list-group-item v-for="message in filteredMessages" :key="message['.key']"
      class="flex-column align-items-start">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">{{ message.name }}</h5>
      <small>{{ message.email }}</small>
      <small>{{ message.phone }}</small>
      <small>{{ tsToDate(message.created) }}</small>
    </div>
    <p class="mb-1">
      {{ message.message }}
    </p>
  </b-list-group-item>
</b-list-group>

</b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  props: [
    'messages',
  ],
  data() {
    return {
      fields: []
    }
  },
  methods: {
    tsToDate(ts) {
      let date = new Date(ts.seconds * 1000)
      return date.toLocaleString()
    },
    childNames(children) {
      return children.map(child => child.name).join(', ')
    }
  },
  computed: {
    filteredMessages() {
      return Array.prototype.slice.call(this.messages).sort((a, b) => b.created.seconds - a.created.seconds)
    }
  },
}
</script>
