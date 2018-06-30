<template>
  <b-container>
    <b-row class="justify-content-md-center">
      <b-col cols="6" >

        <div v-if="signupState == 'closed'">
          <h1 class="title">Coming Soon...</h1>
          <p class="is-medium" v-if="readyState || sendingState">
            To be contacted when sign-ups open, you can leave your email address and JJ will let you know as soon as the fun begins.
          </p>
          <p class="is-medium" v-if="submittedState">
            Thank you. Your email address has been saved, and you will be notified before sign-ups are opened.
          </p>
        </div>

        <div v-if="signupState == 'full'">
            <h1 class="title">Sessions Full</h1>
            <p class="is-medium" v-if="readyState || sendingState">
              Sorry, all sessions are FULL. To be added to a waitlist please email JJ under "Contact JJ".  You can also enter your email address here to be notified if sessions are added.
            </p>
            <p class="is-medium" v-if="submittedState">
              Thank you. Your email address has been saved, and you will be notified if new sessions are added.
            </p>
        </div>

        <sorry v-if="errorState">
          For some reason your information could not be saved. Please try again later.
        </sorry>

        <b-form class="text-center p-3" v-if="signupState != null && readyState || sendingState"
          @submit.prevent="onSubmit">

          <b-form-group>
            <b-form-input required
                    name="name"
                    size="lg"
                    type="text"
                    v-model="form.name"
                    placeholder="Name" />
          </b-form-group>

          <b-form-group>
          <b-form-input required 
                  name="email"
                  size="lg"
                  type="email"
                  v-model="form.email"
                  placeholder="Email Address" />
          </b-form-group>

          <b-button :disabled="sendingState"
              class="ld-ext-right"
              :class="{'running': sendingState}"
              type="submit" size="lg" variant="primary">
            <span>{{ buttonText }}</span>
            <div class="ld ld-ring ld-spin"></div>
          </b-button>

        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import fb from "@/components/shared/firebaseInit"
import Sorry from '@/components/shared/Sorry'
import '@/assets/loading.css'
import '@/assets/loading-btn.css'

export default {
  components: {
    Sorry
  },
  props: ['signupState'],
  data() {
    return {
      state: 'ready',
      form: {
        name: '',
        email: '',
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
  },
  methods: {
    onSubmit() {
      this.state = 'sending'
      fb.waitlist
        .doc(this.form.name)
        .set({ ...this.form, created: fb.ts() })
        .then(() => this.state = 'submitted')
        .catch(error => {
          this.error = error
          this.state == 'error'
        })
    },
  },
}
</script>
