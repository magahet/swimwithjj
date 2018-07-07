<template>
  <b-container class="lead">
    <b-row>
      <b-col>
        <h3>Signups</h3>
        <b-card v-for="(signup, sinupIndex) in signups" :key="sinupIndex">
          {{ signup.parent.name }}
        </b-card>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  props: [
    'signups',
  ],
}
</script>
