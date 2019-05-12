<template>
<b-container>
<!-- <b-row> -->
<b-row class="justify-content-md-center">
<b-col md="6">
<!-- <b-col cols="6" > -->

  <b-form class="text-center p-3" v-if="readyState || sendingState" @submit.once.prevent="onSubmit">

    <h3>Send any questions or concerns and JJ will respond as soon as possible.</h3>


    <b-form-group>

      <b-form-input required size="lg" type="text" name="name" v-model="form.name"
      placeholder="Name"
      />
    </b-form-group>

    <b-form-group>
      <b-form-input required size="lg" type="email" name="email" v-model="form.email"
      placeholder="Email Address"
      />
    </b-form-group>

    <b-form-group>
      <b-form-input required size="lg" type="tel" name="phone" v-model="form.phone"
      placeholder="Phone Number"
      />
    </b-form-group>

    <b-form-group>
      <b-form-textarea required v-model="form.message" :rows="6" name="message"></b-form-textarea>
    </b-form-group>

    <b-button :disabled="sendingState"
        class="ld-ext-right"
        :class="{'running': sendingState}"
        type="submit" size="lg" variant="primary">
      <span>{{ buttonText }}</span>
      <div class="ld ld-ring ld-spin"></div>
    </b-button>

  </b-form>

  <h3 v-if="submittedState">
    Thank you! Your message has been sent.
  </h3>

  <sorry v-if="errorState">
    For some reason your message could not be sent. Please try again later.
  </sorry>

</b-col>
</b-row>
</b-container>
</template>

<script>
import moment from 'moment'
import Sorry from "@/components/shared/Sorry"
import {firestore, ts} from '@/db'

import '@/assets/loading.css'
import '@/assets/loading-btn.css'

export default {
  components: {
    Sorry,
  },
  data() {
    return {
      state: 'ready',
      error: null,
      form: {
        name: '',
        email: '',
        phone: '',
        message: '',
      }
    }
  },
  computed: {
    readyState() {
      return this.state == 'ready'
    },
    sendingState() {
      return this.state == 'sending'
    },
    errorState() {
      return this.state == 'error'
    },
    submittedState() {
      return this.state == 'submitted'
    },
    buttonText() {
      return this.sendingState ? 'Sending' : 'Send'
    },
    messageID() {
      return `${this.form.name} - ${moment().format()}`
    },
  },
  methods: {
    onSubmit() {
      this.state = 'sending'
      let formID = `${this.form.name} - ${moment().format()}`
      firestore.collection('messages')
        .doc(formID)
        .set({ ...this.form, created: ts() })
        .then(() => {
          this.state = 'submitted'
          this.clearForm()
        })
        .catch(error => {
          this.state = 'error'
          this.error = error.message
        })
    },
    clearForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        message: '',
      }
    },
  },
}
</script>