<template>
    <div class="calendar">
        <div class="calendar-header">
            <h4>{{monthHeader}}</h4>
        </div>
        <ul class="weekdays">
            <li v-for="day in days" :key="day.$index">{{ day }}</li>
        </ul>
        <ul class="days">
            <li v-for="blank in firstDayOfMonth" :key="blank.$index">&nbsp;</li>
            <li v-for="date in daysInMonth" :key="date.$index" :class="dateClass(date)" v-b-tooltip.hover :title="dateTitle(date)"> 
                <span>{{ date }}</span>
           </li>
        </ul>
    </div>
</template>

<script>
import moment from 'moment'

export default {
  props: ['year', 'month', 'events'],
  data () {
    return {
        days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    }
  },
  computed: {
    monthHeader() {
        return this.dateContext.format('MMM YYYY')
    },
    dateContext() {
        // Moment takes months indexed starting at 0
        return moment(new Date(this.year, this.month - 1, 1))
    },
    daysInMonth() {
        return this.dateContext.daysInMonth()
    },
    firstDayOfMonth() {
        return this.dateContext.weekday()
    },
  },
  methods: {
      dateClass(day) {
          let sessionNum = this.findSession(day)
          if (sessionNum) {
              return ['session', `session${sessionNum}`]
          }
      },
      dateTitle(day) {
          let sessionNum = this.findSession(day)
          if (sessionNum) {
              return `Session ${sessionNum}`
          }
      },
      findSession(day) {
          let vm = this
          // Find a session that matches the year, month, and day
          let sessionMatch = this.events.find(session => {
              return session.dateList.some(date => {
                  // eslint-disable-next-line
                //   console.log([vm.year, vm.month, day, date])
                  return vm.year == date[0] && vm.month == date[1] && day == date[2]
              })
          })
          if (sessionMatch) {
            return sessionMatch.num
          }
    },
  },
}
</script>

<style scoped>
.calendar {
    margin: 10px;
}

.calendar-header {
    padding: .2rem;
    width: 100%;
    background: #bc7b1a;
    text-align: center;
}

.calendar-header h4 {
    margin: 0px;
}

/* Weekdays (Mon-Sun) */
.weekdays {
    margin: 0;
    padding: .2rem 0;
    background-color:#ddd;
}

.weekdays li {
    display: inline-block;
    width: 13.6%;
    color: #666;
    text-align: center;
}

/* Days (1-31) */
.days {
    padding: .2rem 0;
    background: #eee;
    margin: 0;
}

.days li {
    list-style-type: none;
    display: inline-block;
    width: 13.6%;
    text-align: center;
    font-size: 1rem;
    color: #777;
}

.session-cell {
    margin: -.75rem
}
</style>