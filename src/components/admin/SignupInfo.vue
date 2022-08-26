<template>
  <ul class="list-unstyled">
    <li><span class="font-weight-bold">{{ signup.parent.name }}</span></li>
    <li>{{ tsToDate(signup.created) }}</li>
    <li v-show="!statusEditable">{{ signup.status }}
      <b-link @click.prevent="statusEditable = true"><i class="fas fa-edit"></i>
      </b-link>
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
    <template v-if="more">
      <li>
        <b-link target="_blank"
          :href="'https://manage.stripe.com/customers/' + signup.stripeCustomerId">
          {{ signup.stripeCustomerId }}</b-link>
      </li>
      <li>{{ signup.paymentTotal | currency }}</li>
      <li>{{ signup.parent.email }}</li>
      <li>{{ signup.parent.phone }}</li>
      <li>{{ signup.request }}</li>
      <li>
        <b-button variant="danger" size="sm" @click.prevent="deleteSignup()">
          Delete</b-button>
      </li>
    </template>
    <li>
      <b-btn variant="link" v-show="!more" @click="more = true">more</b-btn>
      <b-btn variant="link" v-show="more" @click="more = false">less</b-btn>
    </li>
  </ul>
</template>

<script>
import { firestore } from '@/db'

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
      const emptyTime = this.signup.children.some((child) => child.sessions.some((session) => session.time.trim().length === 0))
      if (emptyTime) {
        alert('Session times have not been entered for one or more sessions. Please set all session times before changing the status to "lessons scheduled".')
        return
      }
      try {
        await firestore.collection('signups').doc(this.signup.id).update({ status: this.newStatus })
      } catch {
        alert(`could not update signup in firestore: ${this.signup.id}`)
      }
      this.statusEditable = false
    },
    async deleteSignup() {
      if (confirm(`Are you sure you want to delete the signup for ${this.signup.parent.name}?`)) {
        try {
          await firestore.collection('signups').doc(this.signup.id).delete()
        } catch {
          alert(`could not delete signup in firestore: ${this.signup.id}`)
        }
      }
    },
  },
  filters: {
    currency(value) {
      if (typeof value !== "number") {
        return value
      }
      var formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
      })
      return formatter.format(value)
    }
  }
}
</script>