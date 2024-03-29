<template>
  <b-container>
    <b-row>
      <b-col>
        <b-container>
          <b-row class="section lead">
            <b-col>
              <h2>General Info</h2>
              <div class="clearfix">
                <!-- <b-img class="ml-2" right style="max-width: 50%" thumbnail :src="require('../assets/culver_city.jpg')"></b-img> -->
                <p>
                  Lessons are
                  <strong class="text-maroon">30 minutes</strong> long with
                  <strong class="text-maroon">3 to 4 children per lesson</strong
                  >. Sessions run
                  <strong class="text-maroon">2 consecutive weeks</strong>, with
                  lessons <strong class="text-maroon">4 days a week</strong>.
                  Your child will come at the same time for his or her lesson
                  for the entire session. Lessons are for <strong class="text-maroon">children ages 3 and
                  up.</strong>
                </p>
              </div>
            </b-col>
          </b-row>

          <b-row class="section">
            <b-col>
              <h2>Session Dates and Times</h2>

              <sorry v-if="!!error"
                >There was a problem loading the session information. Please try
                again later. If the problem continues, please let me know by
                filling out the contact form. Thanks.</sorry
              >

              <b-container fluid v-if="lessonInfoActive">
                <b-row>
                  <b-col v-for="cal in months" :key="cal.$index" lg="3" md="4">
                    <calendar
                      :year="cal.year"
                      :month="cal.month"
                      :events="sessionList"
                    ></calendar>
                  </b-col>
                </b-row>
              </b-container>

              <div class v-if="!lessonInfoActive">
                <p class="subtitle">
                  Session dates and times will be posted when sign-ups begin.
                  You can be notified when sign-ups start by providing your
                  email address.
                </p>
                <div class>
                  <a href="/sign-up" class="button is-primary"
                    >Go to Notification Form »</a
                  >
                </div>
              </div>
            </b-col>
          </b-row>

          <b-row class="section" v-if="lessonInfoActive">
            <b-col>
              <h2>Sessions</h2>

              <b-table
                responsive
                bordered
                hover
                :items="sessionList"
                :fields="fields"
              >
                <template v-slot:cell(index)="session">
                  <span class="session" ref="session">
                    {{ session.item.num }}
                    <br />
                    <!-- {{ session.item.open ? "" : "CLOSED" }} -->
                    {{ renderSessionLabel(session.item) }}
                  </span>
                </template>
                <template v-slot:cell(datestimes)="session">
                  {{ session.item.dates }}
                  <br />
                  {{ session.item.times }}
                  <br />
                  {{ session.item.notes }}
                </template>
              </b-table>

              <span>
                *Payment is
                <strong class="text-maroon">non-refundable</strong> (unless a
                lesson is canceled by JJ) and
                <strong class="text-maroon">non-transferable.</strong>
              </span>
            </b-col>
          </b-row>

          <b-row class="section">
            <b-col>
              <h2>Location</h2>

              <p>Lessons are taught here:</p>

              <a href="https://goo.gl/maps/Auy9jL33tNPW54zq8" target="_blank">
                <address>
                  853 Mirage Ct.
                  <br />Newbury Park, CA 91320
                </address>
              </a>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6602.572485564248!2d-118.95206516140746!3d34.16459857144125!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80e83a1c8f4561d1%3A0xbf8f9bf6801b5ca6!2s853+Mirage+Ct%2C+Thousand+Oaks%2C+CA+91320!5e0!3m2!1sen!2sus!4v1558025018436!5m2!1sen!2sus"
                width="600"
                height="450"
                frameborder="0"
                style="border: 0"
                allowfullscreen
              ></iframe>

              <!-- <a href="https://goo.gl/maps/auy9jl33tnpw54zq8" target="_blank">
        <b-img thumbnail :src="require('../assets/map.png')"></b-img>
              </a>-->
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Calendar from "./Calendar.vue";
import Sorry from "./shared/Sorry.vue";
import axios from "axios";


export default {
  mounted() {
    axios
      .get(import.meta.env.VITE_SETTINGS_URL)
      .then((response) => {
        this.months = response.data.months;
        this.sessionList = response.data.sessionList;
        this.lessonInfoActive = response.data.lessonInfoActive;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => (this.loading = false));
  },
  updated() {
    // find session num cells in table and add session classes to them for color
    let spans = this.$el.querySelectorAll("span.session");
    for (let i = 0; i < spans.length; ++i) {
      spans[i].parentNode.classList.add("session" + (i + 1));
    }
  },
  components: {
    Calendar,
    Sorry,
  },
  data() {
    return {
      lessonInfoActive: null,
      loading: true,
      error: null,
      months: [],
      sessionList: [],
      fields: [
        {
          key: "index",
          label: "Session",
        },
        {
          key: "datestimes",
          label: "Dates/Times",
        },
        "days",
        {
          key: "price",
          label: "Price*",
          formatter: (value) => `$${value}`,
        },
      ],
    };
  },
  computed: {},
  methods: {
    renderSessionLabel(s) {
      if (s.open) {
        return ""
      }

      return s.sessionLabel ?? "CLOSED"
      

    },
  },
};
</script>

<style>
.session,
.session span {
  color: whitesmoke;
}
.session1 {
  background-color: #0074d9;
}
.session2 {
  background-color: #459772;
}
.session3 {
  background-color: #85144b;
}
.session4 {
  background-color: #001f3f;
}
.session5 {
  background-color: #00c555;
}
.session6 {
  background-color: #b10dc9;
}
.session7 {
  background-color: #508da5;
}
.session8 {
  background-color: #3d9970;
}
.session9 {
  background-color: #0074d9;
}
.session10 {
  background-color: #459772;
}
</style>
