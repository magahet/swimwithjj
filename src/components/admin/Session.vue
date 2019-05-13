<template>
  <div>
    {{ session.id }}:
    <b-link v-if="!!session.time" @click.prevent="editable= true">{{ session.time }}</b-link>
    <b-link v-else @click.prevent="editable= true">set time</b-link>
    <b-input size="sm" v-show="editable" v-model="newTime"/>
    <span v-show="editable">
      <b-link @click.prevent="save()">
        <i class="fas fa-check"></i>
      </b-link> &nbsp;
      <b-link @click.prevent="editable = false">
        <i class="fas fa-times"></i>
      </b-link>
    </span>
  </div>
</template>

<script>
import {firestore} from '@/db'

export default {
  props: ['session', 'signupId', 'childIdx', 'sessionIdx'],
  data() {
    return {
      editable: false,
      newTime: this.session.time,
    }
  },
  methods: {
    async save() {
      let doc = await firestore.collection('signups').doc(this.signupId).get()
      console.debug(doc)
      if (!doc.exists) {
        console.error('Could not find signup to edit in firestore')
        return
      }
      let signup = doc.data()
      signup.children[this.childIdx].sessions[this.sessionIdx].time = this.newTime
      try {
        await firestore.collection('signups').doc(this.signupId).update(signup)
      } catch(err) {
        console.error('could not update signup', err)
      }
      this.editable = false
    }
  },
}
</script>