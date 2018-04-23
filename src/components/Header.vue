<template>
  <b-navbar toggleable="md" type="dark" variant="dark">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand to="/">SwimWithJJ</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <b-navbar-nav>
        <b-nav-item to="/about" activeClass="active" tag="li"><a>About JJ</a></b-nav-item>
        <b-nav-item to="/lesson-info" activeClass="active" tag="li"><a>Lesson Info</a></b-nav-item>
        <b-nav-item to="/faq" activeClass="active" tag="li"><a>FAQ</a></b-nav-item>
        <b-nav-item to="/testimonials" activeClass="active" tag="li"><a>Testimonials</a></b-nav-item>
        <b-nav-item to="/sign-up" activeClass="active" tag="li"><a>Sign-Up</a></b-nav-item>
        <b-nav-item to="/contact" activeClass="active" tag="li"><a>Contact JJ</a></b-nav-item>
      </b-navbar-nav>

    </b-collapse>

  </b-navbar>

</template>
