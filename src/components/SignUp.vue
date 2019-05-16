<template>
<b-container>
<b-row>
<b-col>

  <sorry v-if="setupErrorState">
    There was a problem loading the sign-up form. Please try again later. 
    If the problem continues, please let me know by filling out the contact form. Thanks.
  </sorry>

  <div v-if="!setupErrorState">
    <wait-list v-if="signupClosed || signupFull" :signupState="signupState"></wait-list>

    <b-form v-if="signupOpen" @submit.prevent="onSubmit" @reset="clearForm">

      <b-alert variant="warning" dismissible fade>
        Please do not sign-up unless you are 100% sure your child is able to participate
        in lessons and you are flexible enough to be placed at the lesson time
        given.
      </b-alert>

      <!-- Parent Info -->
      <b-card bg-variant="light" class="mb-3">
        <b-form-group label="Parent's Information" label-size="lg" label-class="font-weight-bold">
          <b-form-row>
            <b-col md="4">
              <b-form-input required :state="isFilled(form.parent.name)" type="text" v-model="form.parent.name"
                name="name"
                placeholder="Full Name"></b-form-input>
            </b-col>
            <b-col md="4">
              <b-form-input required :state="isFilled(form.parent.email)" type="email" v-model="form.parent.email"
                name="email"
                placeholder="Email"></b-form-input>
            </b-col>
            <b-col md="4">
              <b-form-input :state="isFilled(form.parent.phone)" type="tel" v-model="form.parent.phone"
                name="phone"
                placeholder="Phone"></b-form-input>
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group label="How many children are you signing up?" label-class="font-weight-bold">
          <b-form-radio-group buttons button-variant="outline-primary" size="lg" v-model="childCount"
            name="child-count"
            :options="[1,2,3,4]" />
        </b-form-group>

      </b-card>

      <!-- Child Info -->
      <div v-if="drawComponents">
        <b-card bg-variant="light"
          class="mb-3"
          v-for="childNum in childCount"
          :key="childNum">

          <child-info v-model="form.children[childNum - 1]"
            :child-count="childCount"
            :child-num="childNum"
            @destroy="removeChild(childNum)"
            :openSessions="openSessions">
          </child-info>
        </b-card>
      </div>

      <!-- Comments -->
      <b-card bg-variant="light" class="mb-3">
        <b-form-group label="Comments / Special Requests / Needs" label-size="lg" label-class="font-weight-bold"
          description="In a lesson with a friend, etc. (no specific time requests).">

          <b-form-textarea v-model="form.request" :rows="3"></b-form-textarea>

        </b-form-group>
      </b-card>

      <b-card bg-variant="light" class="mb-3">
        <b-form-group label="Payment" label-size="lg" label-class="font-weight-bold" v-if="drawComponents">

          <card class='form-control'
            required
            :class="{ 'is-valid': cardComplete }"
            :stripe="stripePublishKey"
            :options='stripeOptions'
            @change='cardComplete = $event.complete' />

          <b-form-text tag="large" text-variant="black">
            *** Your card will only be charged after JJ confirms your lesson times ***
          </b-form-text>
        </b-form-group>

        <b-form-row>
          <b-col>
            <p class="is-medium">Number of Sessions:
              <strong>{{sessionTotal}}</strong>
            </p>
          </b-col>
          <b-col>
            <p class="is-medium">Payment Total:
              <strong>{{paymentTotal | currency}}</strong>
            </p>
          </b-col>
        </b-form-row>

      </b-card>

      <div class="my-3">
        <span v-b-tooltip.right title="Form is not complete" :disabled="formComplete">

          <b-button :disabled="!formComplete || sendingState"
              class="ld-ext-right"
              :class="{'running': sendingState}"
              type="submit" size="lg" variant="primary">
            <span>{{ buttonText }}</span>
            <div class="ld ld-ring ld-spin"></div>
          </b-button>

        </span>
      </div>

      <b-modal title="Thank You!" centered button-size="lg" ok-only
          :visible="submittedState">
        <p>You have completed the signup process. JJ will confirm your exact lesson
          times
          <strong>within the next 2 weeks.</strong> If you have any additional questions,
          please let her know by using the contact form.</p>
      </b-modal>

      <b-alert variant="danger" dismissible @dismissed="state = 'ready'" fade
          :show="submitErrorState">
        <h4>Sorry</h4>
        <p>
          There was a problem submitting your sign-up form. 
          You can try reloading the page and trying again. 
          Please use the contact form if the problem continues or you need help. 
          Thanks.
        </p>

      </b-alert>

    </b-form>
  </div>

</b-col>
</b-row>
</b-container>
</template>

<script>
/* eslint-disable */
import { Card, createToken } from "vue-stripe-elements-plus";

import WaitList from "@/components/shared/WaitList";
import ChildInfo from "@/components/ChildInfo";
import Sorry from "@/components/shared/Sorry";
import axios from "axios";
import moment from "moment";
import {firestore, ts} from '@/db'
import '@/assets/loading.css'
import '@/assets/loading-btn.css'

export default {
  updated() {},
  components: {
    WaitList,
    ChildInfo,
    Card,
    Sorry,
  },
  data() {
    return {
      signupState: null,
      childCount: 1,
      months: [],
      sessionList: [],
      stripePublishKey: "",
      stripeOptions: {
        hidePostalCode: true,
      },
      form: {
        parent: {
          name: "",
          email: ""
        },
        children: [],
        request: "",
        token: null
      },
      drawComponents: false,
      cardComplete: false,
      error: null,
      state: 'ready',
    };
  },
  created() {
    axios.get("settings.json")
      .then(response => {
        if (typeof response.data === 'string') {
          this.error = 'Could not parse settings.json'
          this.state = 'setupError'
        } else {
          this.signupState = response.data.signupState
          this.stripePublishKey = response.data.stripePublishKey
          this.months = response.data.months
          this.sessionList = response.data.sessionList
          this.drawComponents = true
        }
    })
      .catch(error => {
        this.error = error.message
        this.state = 'setupError'
      })
  },
  computed: {
    setupErrorState() {
      return this.state == 'setupError'
    },
    submitErrorState() {
      return this.state == 'submitError'
    },
    sendingState() {
      return this.state == 'sending'
    },
    submittedState() {
      return this.state == 'submitted'
    },
    signupClosed() {
      return this.signupState == 'closed'
    },
    signupFull() {
      return this.signupState == 'full'
    },
    signupOpen() {
      return this.signupState == 'open'
    },
    buttonText() {
      return this.state == 'sending' ? 'Sending' : 'Send Sign-Up Form'
    },
    openSessions() {
      return this.sessionList.filter(s => s.open)
    },
    sessionTotal() {
      return this.enrolledSessions.length
    },
    paymentTotal() {
      let prices = this.enrolledSessions.map(
        s => this.sessionList[s.id - 1].price
      )
      return prices.length ? prices.reduce((a, b) => a + b) : 0
    },
    enrolledSessions() {
      return [].concat(...this.form.children.map(({ sessions }) => sessions))
    },
    childInfoComplete() {
      return this.form.children.every(child => {
        return [
          this.isFilled(child.name),
          this.isFilled(child.birthday),
          this.isFilled(child.level),
          child.sessions.length
        ].every(e => !!e)
      })
    },
    formComplete() {
      // check if all conditions eval to true
      return [
        this.isFilled(this.form.parent.name),
        this.isFilled(this.form.parent.email),
        this.isFilled(this.form.parent.email),
        this.childInfoComplete,
        this.cardComplete,
      ].every(e => !!e)
    }
  },
  methods: {
    removeChild(childNum) {
      let index = this.form.children.findIndex(c => c.id == childNum)
      this.form.children.splice(index, 1)
    },
    onSubmit() {
      this.state = 'sending'
      createToken()
        .then(data => {
          this.form.token = data.token.id
          this.saveForm()
        })
        .catch(error => {
          this.state = 'submitError'
          this.error = error.message
        })
    },
    saveForm() {
      let formID = `${this.form.parent.name} - ${moment().format()}`
      firestore.collection('signups')
        .doc(formID)
        .set({
          ...this.form,
          created: ts(),
          paymentTotal: this.paymentTotal,
          status: 'signup received',
        })
        .then(() => {
          this.state = 'submitted'
          this.clearForm()
        })
        .catch(error => {
          this.state = 'submitError'
          this.error = error.message
        })
    },
    isFilled(value) {
      if (value) {
        return value.length > 1 ? true : null
      }
    },
    clearForm() {
      this.form = {
        parent: {
          name: "",
          email: ""
        },
        children: [],
        request: "",
        token: null
      }
      this.childCount = 1

      this.drawComponents = false
      this.$nextTick(() => (this.drawComponents = true))
      this.cardComplete = false
    }
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

<style>
.btn-outline-primary:not(:disabled):not(.disabled):active,
.btn-outline-primary:not(:disabled):not(.disabled).active,
.show > .btn-outline-primary.dropdown-toggle {
  background-color: #0062cc;
  border-color: #005cbf;
}
</style>
