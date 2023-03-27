import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home.vue'
import About from '@/components/About.vue'
import LessonInfo from '@/components/LessonInfo.vue'
import FAQ from '@/components/FAQ.vue'
import Testimonials from '@/components/Testimonials.vue'
import SignUp from '@/components/SignUp.vue'
import Contact from '@/components/Contact.vue'
import Admin from '@/components/Admin.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {path: '/', component: Home},
    {path: '/about', component: About, meta: {title: 'About JJ'}},
    {path: '/lesson-info', component: LessonInfo, meta: {title: 'Lesson Info'}},
    {path: '/faq', component: FAQ, meta: {title: 'FAQ'}},
    {path: '/testimonials', component: Testimonials, meta: {title: 'Testimonials'}},
    {path: '/sign-up', component: SignUp, meta: {title: 'Sign-Up'}},
    {path: '/contact', component: Contact, meta: {title: 'Contact JJ'}},
    {path: '/admin', component: Admin, meta: {title: 'Admin'}},
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  },
})
