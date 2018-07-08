<template>
<b-container fluid>
<b-row>
<b-col>

<h4>Settings</h4>

<pre class="my-3">
  {{ settings }}
</pre>

</b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  props: ['settings'],
}
</script>

<style scoped>
pre {
  background-color: white;
}
</style>
