<template>
  <div>
    <b-jumbotron class="jumbotron" header="Swim With JJ" lead="Water Safety, Swim Lessons, and Stroke Technique in a comfortable and relaxing setting">
      <b-btn variant="success" to="/lesson-info">Learn More »</b-btn>
    </b-jumbotron>

    <b-container>
      <b-row>
        <b-col>
          <img src='../assets/lifejacket.jpg'>
          <h2>Safety First, Fun Next</h2>
          <p>The primary focus for each class is <strong class="emph">water safety</strong>. The water should be a place to have fun and be playful, but staying afloat is the first priority. JJ teaches her students <strong class="emph">not to rely on swimming aids</strong> or help from others. Kids are taught to stay calm if they fall into the water, how to float on their own, and how to get back to the wall.</p>
        </b-col>
        <b-col>
          <img src='../assets/swimming.png'>
          <h2>Small Group Learning</h2>
          <p>Lessons are made up of <strong class="emph">2 to 4 students</strong> at the same level of swimming proficiency. The groups are small enough that each child receives <strong class="emph">personalized instruction</strong>. At the same time, the group setting allows kids to learn from watching others and to receive <strong class="emph">positive reinforcement</strong> from their peers.</p>
        </b-col>
        <b-col>
          <img src='../assets/diver.jpg'>
          <h2>Underwater Adventure</h2>
          <p>Anxiety around the water is a normal reaction. However, many of JJ's swimmers develop an <strong class="emph">excitement and confidence</strong> in their abilities that surprises and inspires them. JJ finds the <strong class="emph">balance between empathy and firmness</strong> that empowers her students to abandon their fears and learn to love the water.</p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style>
.jumbotron {
  position: relative;
  background: #000 url("../assets/underwater_crop.jpg") center center;
  width: 100%;
  height: 100%;
  background-size: cover;
  color: #fff;
  border-radius: 0px;

  /*background: url("../assets/underwater_crop.jpg") no-repeat top;*/
  /*background-size: 100% 350px;*/
  /*padding: 50px;*/
}

.hero-section .hero-section-text p {
  color: #fefefe;
}
</style>
