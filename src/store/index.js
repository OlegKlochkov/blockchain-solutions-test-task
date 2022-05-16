import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    portfolio: {
      USD: 10000,
      BTC: 1.035,
      ETH: 10
    }
  },
  getters: {
    getPortfolio(state){
      return state.portfolio;
    }
  },
  mutations: {
    setBTCAmount(state, payload){
      state.portfolio.BTC = payload;
    },
    setETHAmount(state, payload){
      state.portfolio.ETH = payload;
    }
  },
  actions: {
    setBTCAmount_action({commit}, payload){
      commit('setBTCAmount', payload);
    },
    setETHAmount_action({commit}, payload){
      commit('setETHAmount', payload);
    }
  },
  modules: {
  }
})
