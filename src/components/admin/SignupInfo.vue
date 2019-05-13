<template>
<ul class="list-unstyled">
  <li><span class="font-weight-bold">{{ signup.parent.name }}</span></li>
  <li>{{ tsToDate(signup.created) }}</li>
  <li v-show="!statusEditable">{{ signup.status }} 
    <b-link @click.prevent="statusEditable = true"><i class="fas fa-edit"></i></b-link>
  </li>
  <li v-show="statusEditable">
    <b-select v-model="newStatus" :options="statusList" />
    <b-link @click.prevent="changeStatus">
      <i class="fas fa-check"></i>
    </b-link> &nbsp;
    <b-link @click.prevent="statusEditable = false">
      <i class="fas fa-times"></i>
    </b-link>
  </li>
  <li v-show="more">{{ signup.parent.email }}</li>
  <li v-show="more">{{ signup.parent.phone}}</li>
  <li v-show="more">
      {{ signup.request }} 
  </li>
  <li>
    <b-btn variant="link" v-show="!more"
        @click="more = true">more</b-btn>
    <b-btn variant="link" v-show="more"
        @click="more = false">less</b-btn>
  </li>
</ul>
</template>

<script>
import {firestore} from '@/db'

export default {
  props: ['signup', 'statusList'],
  data() {
    return {
      more: false,
      statusEditable: false,
      newStatus: this.signup.status,
    }
  },
  methods: {
    tsToDate(ts) {
      let date = new Date(ts.seconds * 1000)
      return date.toLocaleString()
    },
    async changeStatus() {
      try {
        await firestore.collection('signups').doc(this.signup.id).update({status: this.newStatus})
      } catch {
        console.error('could not update signup in firestore', this.signup.id)
      }
      this.statusEditable = false
    },
  },
}
</script>