<template>
  <div class="PortfolioComponent">
    <PieChart
      v-if="renders > 1" :key="renders"
      :chartData="res"
      :options="chartOptions"
      :chartColors="backgroundColors"
    />
    <div class="" v-else>Loading...</div>
    <div class="totalPortfolio" v-if="totalValue !== ''">
      Оценка портфеля в долларах: {{ totalValue }}
    </div>
    <div class="usdAmount">USD: {{ usdValue }}$</div>
    <div class="btcAmount">BTC: {{ btcAmount }} ( {{ btcValue }} $)</div>
    <div class="ethAmount">ETH: {{ ethAmount }} ( {{ ethValue }} $)</div>
    <div class="btcChange">
      <label for="btcChangeInput">Change BTC amount</label>
      <input
        type="number"
        name="btcChangeInput"
        id="btcChangeInput"
        v-model.number="btcChange"
      />
      <button @click="btcAmount += btcChange">+</button>
      <button @click="btcAmount -= btcChange">-</button>
    </div>
    <div class="ethChange">
      <label for="ethChangeInput">Change ETH amount</label>
      <input
        type="number"
        name="ethChangeInput"
        id="ethChangeInput"
        v-model.number="ethChange"
      />
      <button @click="ethAmount += ethChange">+</button>
      <button @click="ethAmount -= ethChange">-</button>
    </div>
  </div>
</template>

<script>
import PieChart from "../components/PieChart.vue";
import axios from "axios";

export default {
  name: "PortfolioComponent",
  components: {
    PieChart,
  },
  data() {
    return {
      res: [],
      totalValue: "",
      renders: 0,//ключ для графика, изменение которого вызывает ререндер
      usdValue: "",
      btcValue: "",
      btcAmount: "",
      btcChange: 0,
      ethValue: "",
      ethAmount: "",
      ethChange: 0,
      exchangeRate: "",
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
      backgroundColors: ["#1E9600", "#99C802", "#FFF200"],
    };
  },
  async created() {
    const portfolio = this.$store.getters.getPortfolio;
    this.usdValue = portfolio.USD;
    await this.getExchangeRate("bitcoin", "usd");
    this.btcAmount = portfolio.BTC;
    this.btcValue = this.btcAmount * this.exchangeRate;
    await this.getExchangeRate("ethereum", "usd");
    this.ethAmount = portfolio.ETH;
    this.ethValue = this.ethAmount * this.exchangeRate;
    this.res = [
        ["USD", this.usdValue],
        ["BTC", this.btcValue],
        ["ETH", this.ethValue],
      ];
    this.totalValue = this.usdValue + this.btcValue + this.ethValue + "$";
  },
  methods: {
    async getExchangeRate(from, to) {
      this.exchangeRate = "";
      await axios
        .get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
        )
        .then((response) => {
          this.exchangeRate = response.data[from][to];
        });
    },
  },
  watch: {
    btcChange(newValue, oldValue) {
      if (newValue < 0) {
        this.btcChange = oldValue;
      }
    },
    ethChange(newValue, oldValue) {
      if (newValue < 0) {
        this.ethChange = oldValue;
      }
    },
    async btcAmount(newValue) {
      this.$store.dispatch('setBTCAmount_action', newValue);
      await this.getExchangeRate("bitcoin", "usd");
      this.btcValue = newValue * this.exchangeRate;
      this.res = [];
      this.res = [
        ["USD", this.usdValue],
        ["BTC", this.btcValue],
        ["ETH", this.ethValue],
      ];
      this.renders++;
    },
    async ethAmount(newValue) {
      this.$store.dispatch('setETHAmount_action', newValue);
      await this.getExchangeRate("ethereum", "usd");
      this.ethValue = newValue * this.exchangeRate;
      this.res = [];
      this.res = [
        ["USD", this.usdValue],
        ["BTC", this.btcValue],
        ["ETH", this.ethValue],
      ];
      this.renders++;
    },
  },
};
</script>

<style scoped>
</style>