<template>
  <b-container>
    <b-row>
      <b-col>
        <section class="section">
          <div class="container is-clearfix">

            <div class="heading">
              <h2 class="title">General Info</h2>
            </div>

            <div class="clearfix">
              <b-img right thumbnail fluid :src="require('../assets/culver_city.jpg')"></b-img>
              <p class="subtitle">Lessons are <strong class="emph">30 minutes</strong> long with <strong class="emph">4 children per lesson</strong>. Sessions run <strong class="emph">2 consecutive weeks</strong>, with lessons <strong class="emph">4 days a week</strong>. Your child will come at the same time for his or her lesson for the entire session.</p>
            </div>


          </div>
        </section>

        <section class="section">
          <div class="container">

            <div class="heading">
              <h2 class="title">Session Dates and Times</h2>
            </div>

            <div v-if="lessonInfoActive">
              <div class="container" v-html="calendar"></div>
            </div>

            <div class="" v-if="!lessonInfoActive">
              <p class="subtitle">Session dates and times will be posted when sign-ups begin. You can be notified when sign-ups start by providing your email address.</p>
              <div class=""><a href="/sign-up" class="button is-primary">Go to Notification Form »</a></div>
            </div>

          </div>
        </section>

        <section class="section" v-if="lessonInfoActive">
          <div class="container">
            <div class="heading">
              <h2 class="title">Sessions</h2>
            </div>

            <b-table bordered hover :items="sessionList" :fields="fields"></b-table>

            <ul class="">
              <li>*Payment is <strong class="emph">non-refundable</strong> (unless a lesson is canceled by JJ) and <strong class="emph">non-transferable.</strong></li>
            </ul>

          </div>
        </section>

        <section class="section">
          <div class="container">

            <div class="heading">
              <h2>Location</h2>
            </div>

            <p class="">Lessons are taught here:</p>

            <div class="columns">
              <div class="column is-half">

                <div class="card">
                  <div class="card-content">
                    <a href="https://maps.google.com/maps?q=4261+Lincoln+Ave.+Culver+City,+CA+90232&hl=en&sll=34.020479,-118.411732&sspn=1.183749,0.928345&hnear=4261+Lincoln+Ave,+Culver+City,+Los+Angeles,+California+90232&t=m&z=17" target="_blank">
                      <address class="">
                        4261 Lincoln Ave.<br>
                        Culver City, CA 90232
                      </address>
                    </a>
                  </div>
                  <div class="card-image">
                    <figure class="image">
                      <a href="https://maps.google.com/maps?q=4261+Lincoln+Ave.+Culver+City,+CA+90232&hl=en&sll=34.020479,-118.411732&sspn=1.183749,0.928345&hnear=4261+Lincoln+Ave,+Culver+City,+Los+Angeles,+California+90232&t=m&z=17" target="_blank">
                        <img src="static/culver-city-map.png">
                      </a>
                    </figure>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </b-col>
    </b-row>
  </b-container>
</template>

<!--<td v-bind:class="'session' + s.num">{{s.num}} <span v-if="!s.open"><br>CLOSED</span></td>-->
<!--<td>-->
<!--{{s.dates}}</br>-->
<!--{{s.times}}</br>-->
<!--{{s.note}}-->
<!--</td>-->
<!--<td>{{s.days}}</td>-->
<!--<td>${{s.price}}</td>-->

<script>
export default {
  data () {
    return {
      lessonInfoActive: true,
      fields: [
        {
          key: 'num',
          label: 'Session',
          formatter: (value, key, item) => {
            return `${item.num}<br>${item.open ? '' : 'CLOSED'}`
          }
        },
        {
          key: 'datesTimes',
          label: 'Dates/Times',
          formatter: (value, key, item) => {
            return `${item.dates}<br>${item.times}<br>${item.notes}`
          }
        },
        'days',
        {key: 'price', label: 'Price*'}
      ],
      sessionList: [
        {
          num: 1,
          open: false,
          dates: 'April 2nd to April 5th',
          times: 'lesson times between 3:00pm and 5:30pm',
          notes: '',
          days: 'Monday to Thursday',
          price: 200
        }
      ]
    }
  }
}
</script>
