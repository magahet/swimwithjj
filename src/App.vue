<template>
  <div v-cloak>
    <b-navbar sticky toggleable="md" type="dark" variant="dark"
        v-if="$route.meta.title != 'Admin'">

      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand to="/">SwimWithJJ</b-navbar-brand>

      <b-collapse is-nav id="nav_collapse" v-model="showMobileNav">

        <b-navbar-nav>
          <b-nav-item @click="showMobileNav = false" to="/about" activeClass="active" tag="li"><a>About JJ</a></b-nav-item>
          <b-nav-item @click="showMobileNav = false" to="/lesson-info" activeClass="active" tag="li"><a>Lesson Info</a></b-nav-item>
          <b-nav-item @click="showMobileNav = false" to="/faq" activeClass="active" tag="li"><a>FAQ</a></b-nav-item>
          <b-nav-item @click="showMobileNav = false" to="/testimonials" activeClass="active" tag="li"><a>Testimonials</a></b-nav-item>
          <b-nav-item @click="showMobileNav = false" to="/sign-up" activeClass="active" tag="li"><a>Sign-Up</a></b-nav-item>
          <b-nav-item @click="showMobileNav = false" to="/contact" activeClass="active" tag="li"><a>Contact JJ</a></b-nav-item>
        </b-navbar-nav>

      </b-collapse>

    </b-navbar>

    <div class="section-header"
        v-if="$route.meta.title && $route.meta.title != 'Admin'">
      <h1 class="text-light">{{$route.meta.title}}</h1>
    </div>

    <router-view></router-view>

    <footer class="footer p-5"
        v-if="$route.meta.title != 'Admin'">
      <hr>
      <b-container>
        <span class="text-muted">SwimWithJJ</span>
      </b-container>
    </footer>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        showMobileNav: false,
      }
    },
  }
</script>

<style>
  .section-header {
    background: url(./assets/underwater_crop.jpg) no-repeat center;
    background-size: cover;
    background-color: #003399;
    padding: 40px;
    padding-bottom: 10px;
    margin-bottom: 2rem;
  }
  .section {
    margin-bottom: 2rem;
  }
  .section h2, h3, h4, h5, h6 {
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  }
  .text-maroon {
    color: #C44D58;
  }
  strong {
    font-size: 1.25rem;
    font-weight: bold;
  }
</style>
