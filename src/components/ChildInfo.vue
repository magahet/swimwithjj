<template>
  <b-form-group :label="childLabel" label-size="lg" label-class="font-weight-bold">

    <b-form-row class="mb-3">
      <b-col md="6">
        <b-form-group label="Name">
          <b-form-input
            :state="isFilled(name)"
            class="input"
            type="text"
            v-model="name"
            name="name"
            placeholder="First Name"
            @input="updateData()">
          </b-form-input>
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Birthday">
          <b-form-input
            :state="isFilled(birthday)"
            class="input"
            type="date"
            v-model="birthday"
            name="birthday"
            placeholder="Birthday"
            @input="updateData()">
          </b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

<b-form-select
  :state="isFilled(level)"
  v-model="level"
  name="level"
  class="mb-3"
  :options="levelOptions"
  required
  @input="updateData()">
</b-form-select>

    <b-form-group label="Sessions" description="Add all the sessions you are interested in">
      <b-form-checkbox-group
        v-model="sessions"
        name="sessions"
        class="checkbox-buttons"
        @input="updateData()"
        buttons button-variant="outline-primary"
        size="sm"
        stacked :options="sessionOptions">
      </b-form-checkbox-group>
    </b-form-group>

  </b-form-group>
</template>

<script>
export default {
  props: ["value", "childCount", "childNum", "openSessions"],
  data() {
    return {
      name: "",
      birthday: "",
      level: null,
      sessions: [],
      levelOptions: [
        { value: null, text: "-- Select swimming level --", disabled: true },
        "uncomfortable putting his or her face in the water",
        "comfortable putting his or her face in the water",
        "can swim the width of a pool",
        "advanced swimmer, can swim length of a pool"
      ]
    };
  },
  mounted() {
    this.updateData();
  },
  methods: {
    updateData() {
      this.$emit("input", {
        id: this.childNum,
        name: this.name,
        birthday: this.birthday,
        level: this.level,
        sessions: this.sessions
      });
    },
    isFilled(value) {
      if (value) {
        return value.length > 2 ? true : null;
      }
    }
  },
  computed: {
    childLabel() {
      var label = "Child's Information";
      var prefix = ["First ", "Second ", "Third ", "Fourth "];

      if (this.childCount == 1) {
        return label;
      } else {
        return prefix[this.childNum - 1] + label;
      }
    },
    sessionOptions() {
      return this.openSessions.map(s => {
        return {
          text: `Session ${s.num}: ${s.dates}`,
          value: {id: s.num, time: '', text: `Session ${s.num}: ${s.dates}`},
        };
      });
    }
  },
  filters: {
    formatSession: function(session) {
      return "Session " + session.num + " - " + session.dates;
    },
    currency: function(price) {
      return "$" + price;
    }
  },
  destroyed() {
    this.$emit("destroy");
  }
};
</script>

<style>
.checkbox-buttons label.btn.focus {
  box-shadow: none;
}

.checkbox-buttons label {
  text-align: left;
}
</style>
