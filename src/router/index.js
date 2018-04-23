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
    {path: '/about', component: About},
    {path: '/lesson-info', component: LessonInfo},
    {path: '/faq', component: FAQ},
    {path: '/testimonials', component: Testimonials},
    {path: '/sign-up', component: SignUp},
    {path: '/contact', component: Contact},
  ]
})
