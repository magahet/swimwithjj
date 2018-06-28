<template>
  <b-container class="lead">
    <b-row>
      <b-col>
        <wait-list v-if="signupState != 'open'" :signupState="signupState"></wait-list>

        <b-form v-if="signupState = 'open'" @submit.prevent="onSubmit" @reset="clearForm">

          <b-alert variant="warning" dismissible fade>
            <h4 class="subtitle emph">Please do not sign-up unless you are 100% sure your child is able to participate in lessons and you are flexible enough to be placed at the lesson time given.</h4>
          </b-alert>

          <!-- Parent Info -->
          <b-card bg-variant="light" class="mb-3">
            <b-form-group label="Parent's Information" label-size="lg" label-class="font-weight-bold">
              <b-form-row>
                <b-col>
                  <b-form-input required :state="isFilled(form.parent.name)" type="text" v-model="form.parent.name" placeholder="Full Name"></b-form-input>
                </b-col>
                <b-col>
                  <b-form-input required :state="isFilled(form.parent.email)" type="email" v-model="form.parent.email" placeholder="Email"></b-form-input>
                </b-col>
                <b-col>
                  <b-form-input :state="isFilled(form.parent.phone)" type="tel" v-model="form.parent.phone" placeholder="Phone"></b-form-input>
                </b-col>
              </b-form-row>
            </b-form-group>

            <b-form-group label="How many children are you signing up?" label-class="font-weight-bold">
              <b-form-radio-group id="btnradios1" buttons button-variant="outline-primary" size="lg" v-model="childCount" :options="[1,2,3,4]" />
            </b-form-group>

          </b-card>

          <!-- Child Info -->
          <b-card bg-variant="light" class="mb-3" v-for="childNum in childCount" :key="childNum" v-if="drawFormComponents">
            <child-info v-model="form.children[childNum - 1]" :child-count="childCount" :child-num="childNum" @destroy="removeChild(childNum)" :openSessions="openSessions"></child-info>
          </b-card>

          <!-- Comments -->
          <b-card bg-variant="light" class="mb-3">
            <b-form-group label="Comments / Special Requests / Needs" label-size="lg" label-class="font-weight-bold" description="In a lesson with a friend, etc. (no specific time requests).">

              <b-form-textarea v-model="form.request" :rows="3"></b-form-textarea>

            </b-form-group>
          </b-card>

          <b-card bg-variant="light" class="mb-3">
            <b-form-group label="Payment" label-size="lg" label-class="font-weight-bold" v-if="drawFormComponents" description="* Your card will only be charged after JJ confirms your lesson times.">

              <card class='form-control' required :class="{ 'is-valid': cardComplete }" :stripe="stripePublishKey" @change='cardComplete = $event.complete' />

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

          <!-- <button class='pay-with-stripe' @click='pay' :disabled='!complete'>Pay with credit card</button> -->
          <div class="my-3">
            <span v-b-tooltip.right title="Form is not complete" :disabled="formComplete">
              <b-button type="submit" variant="primary" size="lg" :disabled="!formComplete">Submit Sign-up Form</b-button>
            </span>

            <!-- <b-button @click="error = true">Test</b-button> -->

          </div>

          <b-modal title="Thank You!" centered button-size="lg" ok-only :visible="showThankYou">
            <p>You have completed the signup process. JJ will confirm your exact lesson times
              <strong>within the next 3 weeks.</strong> If you have any additional questions, please let her know by using the contact form.</p>
          </b-modal>

          <b-alert variant="danger" dismissible @dismissed="error = null" fade :show="!!error">
            <h4>Sorry</h4>
            <p>There was a problem submitting your sign-up form. Please use the contact form if you need help. Thanks.</p>

          </b-alert>

        </b-form>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable */
import { Card, createToken } from "vue-stripe-elements-plus";

import WaitList from "./WaitList.vue";
import ChildInfo from "./ChildInfo.vue";
import axios from "axios";
import fb from "./firebaseInit";
import moment from "moment";

export default {
  updated() {},
  components: {
    WaitList,
    ChildInfo,
    Card
  },
  data() {
    return {
      signupState: "open",
      childCount: 1,
      months: [],
      sessionList: [],
      stripePublishKey: "pk_test_PkNVl7B3DrwF22CceHIRQ12b",
      form: {
        parent: {
          name: "",
          email: ""
        },
        children: [],
        request: "",
        token: null
      },
      drawFormComponents: true,
      cardComplete: false,
      error: null,
      showThankYou: false
    };
  },
  created() {
    axios.get("sessions.json").then(response => {
      this.months = response.data.months;
      this.sessionList = response.data.sessionList;
    });
  },
  computed: {
    openSessions() {
      return this.sessionList.filter(s => s.open);
    },
    sessionTotal() {
      return this.enrolledSessions.length;
    },
    paymentTotal() {
      let prices = this.enrolledSessions.map(
        s => this.sessionList[s - 1].price
      );
      return prices.length ? prices.reduce((a, b) => a + b) : 0;
    },
    enrolledSessions() {
      return [].concat(...this.form.children.map(({ sessions }) => sessions));
    },
    childInfoComplete() {
      return this.form.children.every(child => {
        return [
          this.isFilled(child.name),
          this.isFilled(child.birthday),
          this.isFilled(child.level),
          child.sessions.length
        ].every(e => !!e);
      });
    },
    formComplete() {
      // check if all conditions eval to true
      return [
        this.isFilled(this.form.parent.name),
        this.isFilled(this.form.parent.email),
        this.isFilled(this.form.parent.email),
        this.childInfoComplete,
        this.cardComplete
      ].every(e => !!e);
    },
    formID() {
      return `${this.form.parent.name} - ${moment().format()}`;
    }
  },
  methods: {
    removeChild(childNum) {
      if (this.form.children.length >= childNum) {
        this.form.children.splice(childNum - 1, 1);
      }
    },
    onSubmit() {
      createToken()
        .then(data => {
          this.form.token = data.token.id;
          this.saveForm();
        })
        .catch(error => console.log(error));
    },
    saveForm() {
      fb.signups
        .doc(this.formID)
        .set({ ...this.form, created: fb.ts() })
        .then(docRef => {
          this.showThankYou = true;
          this.clearForm();
        })
        .catch(error => (this.error = error));
    },
    isFilled(value) {
      if (value) {
        return value.length > 1 ? true : null;
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
      };
      this.childCount = 1;

      this.drawFormComponents = false;
      this.$nextTick(() => (this.drawFormComponents = true));
      cardComplete = false;
    }
  },
  filters: {
    currency(value) {
      if (typeof value !== "number") {
        return value;
      }
      var formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
      });
      return formatter.format(value);
    }
  }
};
</script>

<style>
.btn-outline-primary:not(:disabled):not(.disabled):active,
.btn-outline-primary:not(:disabled):not(.disabled).active,
.show > .btn-outline-primary.dropdown-toggle {
  background-color: #0062cc;
  border-color: #005cbf;
}
</style>
