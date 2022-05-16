<template>
  <div class="PortfolioComponent">
    <div class="PortfolioInfo" v-if="renders > 1">
      <h1 class="PortfolioTitle">Портфель</h1>
      <h2 class="TotalPortfolio" v-if="totalValue !== ''">
        Оценка портфеля в долларах: {{ totalValue }}
      </h2>
      <h3 class="USDAmount">
        <img class="CurrencyImage" src="../assets/usa.png" alt="" /> USD: {{ usdValue }}$
      </h3>
      <h3 class="BTCAmount">
        <img class="CurrencyImage" src="../assets/bitcoin.png" alt="" /> BTC: {{ btcAmount }} (
        {{ btcValue }} $)
      </h3>
      <h3 class="ETHAmount">
        <img class="CurrencyImage" src="../assets/ethereum.png" alt="" /> ETH: {{ ethAmount }} (
        {{ ethValue }} $)
      </h3>
      <div class="ChangeAmount">
        <label for="btcChangeInput">Прибавить/отнять BTC: </label>
        <input
          class="ChangeAmountInput"
          type="number"
          name="btcChangeInput"
          id="btcChangeInput"
          v-model.number="btcChange"
        />
        <button class="AddButton" @click="btcAmount += btcChange">+</button>
        <button class="SubstractButton" @click="btcAmount -= btcChange">
          -
        </button>
      </div>
      <div class="ChangeAmount">
        <label for="ethChangeInput">Прибавить/отнять ETH: </label>
        <input
          class="ChangeAmountInput"
          type="number"
          name="ethChangeInput"
          id="ethChangeInput"
          v-model.number="ethChange"
        />
        <button class="AddButton" @click="ethAmount += ethChange">+</button>
        <button class="SubstractButton" @click="ethAmount -= ethChange">
          -
        </button>
      </div>
    </div>
    <PieChart
      class="USDValueChart"
      v-if="renders > 1"
      :key="renders"
      :chartData="res"
      :options="chartOptions"
      :chartColors="backgroundColors"
    />
    <div class="" v-else>Загрузка...</div>
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
      renders: 0, //ключ для графика, изменение которого вызывает ререндер
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
      this.$store.dispatch("setBTCAmount_action", newValue);
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
      this.$store.dispatch("setETHAmount_action", newValue);
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
.PortfolioComponent {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.PortfolioInfo {
  border: 1px solid black;
  border-radius: 10px;

  padding: 2%;
}

.PortfolioTitle {
  width: 100%;
  padding: 2%;
  border-bottom: 1px solid black;
}

.USDAmount,
.BTCAmount,
.ETHAmount {
  height: 32px;
  text-align: center;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.CurrencyImage{
  margin-right: 1%;
}

.ChangeAmountInput,
.AddButton,
.SubstractButton {
  background: none;
  border: 1px solid black;
  border-radius: 5px;
  margin: 0.5%;
}

.USDValueChart {
  position: relative;
  width: 40%;
}

@media screen and (max-width: 550px) {
  .PortfolioComponent{
    flex-direction: column;
  }

.PortfolioInfo {
  padding: 0%;
  margin-bottom: 2%;
}

.USDAmount,
.BTCAmount,
.ETHAmount {
  height: 12px;
}

.ChangeAmount{
  margin-bottom: 2%;
}

  .ChangeAmountInput,
.AddButton,
.SubstractButton {
  background: none;
  border: 1px solid black;
  border-radius: 5px;
  margin: 0%;
}

.ChangeAmountInput{
  width: 30%;
}

.USDValueChart {
  width: 75%;
}

}
</style>