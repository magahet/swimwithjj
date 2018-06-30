<template>
  <div class="w-75 mx-auto">
    <b-img center rounded class="mb-3" width="200" :src="require('@/assets/sorry.jpg')"></b-img>
    <h3 class="text-center ">
      <slot></slot>
    </h3>
  </div>
</template>