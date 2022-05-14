import Vue from 'vue'
import VueRouter from 'vue-router'
import ConverterView from '../views/ConverterView.vue'
import PortfolioView from '../views/PortfolioView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: ConverterView
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: PortfolioView
  }
]

const router = new VueRouter({
  routes
})

export default router
