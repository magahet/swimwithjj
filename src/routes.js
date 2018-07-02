import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import About from '@/components/About'
import LessonInfo from '@/components/LessonInfo'
import FAQ from '@/components/FAQ'
import Testimonials from '@/components/Testimonials'
import SignUp from '@/components/SignUp'
import Contact from '@/components/Contact'

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
    {path: '/contact', component: Contact, meta: {title: 'Contact JJ'}}
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  },
})
