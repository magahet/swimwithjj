<template>
  <div>

    <div v-if="closed">
      <h1 class="title">Coming Soon...</h1>
      <p class="is-medium" v-if="!submitted">
        To be contacted when sign-ups open, you can leave your email address and JJ will let you know as soon as the fun begins.
      </p>
      <p class="is-medium" v-if="submitted">
        Thank you. Your email address has been saved, and you will be notified before sign-ups are opened.
      </p>
    </div>

    <div v-if="full">
        <h1 class="title">Sessions Full</h1>
        <p class="is-medium" v-if="!submitted">
          Sorry, all sessions are FULL. To be added to a waitlist please email JJ under "Contact JJ".  You can also enter your email address here to be notified if sessions are added.
        </p>
        <p class="is-medium" v-if="submitted">
          Thank you. Your email address has been saved, and you will be notified if new sessions are added.
        </p>
    </div>

    <b-form inline v-if="!submitted" @submit.prevent="onSubmit">

      <b-form-input required
               size="lg"
               type="text"
               v-model="form.name"
               class="mb-2 mr-sm-2 mb-sm-0"
               placeholder="Name" />
      <b-form-input required 
               size="lg"
               type="email"
               v-model="form.email"
               class="mb-2 mr-sm-2 mb-sm-0"
               placeholder="Email Address" />

      <b-button type="submit" size="lg" variant="primary">Notify Me</b-button>

    </b-form>

  </div>
</template>

<script>
export default {
  props: ['signupState'],
  data() {
    return {
      form: {
        name: '',
        email: '',
      }
    }
  },
  computed: {
    // emailValid() {
    //   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //   return re.test(this.emailAddress)
    // },
    closed() {
      return this.signupState == 'closed'
    },
    full() {
      return this.signupState == 'full'
    },
    submitted() {
      return this.signupState == 'submitted'
    },
  },
  methods: {
    onSubmit() {
      // TODO submit to DB
      alert(JSON.stringify(this.form));
    },
  },
}
</script>
