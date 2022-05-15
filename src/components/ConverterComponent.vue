<template>
  <div class="hello">
    <div>
      <label for="convertedFromSelector">From</label>
      <select
        name="convertedFrom"
        id="convertedFromSelector"
        @change="convertedFrom = $event.target.value"
        :value="convertedFrom"
      >
        <option value="BTC">Bitcoin</option>
        <option value="ETH">Ether</option>
        <option value="USD">US Dollar</option>
      </select>
      <label for="convertedToSelector">To</label>
      <select
        name="convertedTo"
        id="convertedToSelector"
        @change="convertedTo = $event.target.value"
        :value="convertedTo"
      >
        <option value="BTC">Bitcoin</option>
        <option value="ETH">Ether</option>
        <option value="USD">US Dollar</option>
      </select>
    </div>
    <div class="exchangeRate" v-if="exchangeRate !== ''">
      <input type="number" v-model.number="convertedAmount" @input="convert($event.target.value)">
      {{convertedFrom}} = {{convertionResult}} {{convertedTo}}
    </div>
    <LineChart
      v-if="res.length > 0"
      :chartData="res"
      :options="chartOptions"
      :chartColors="colors"
      :label="label"
    />
    <div class="loader" v-else>Loading...</div>
  </div>
</template>

<script>
import LineChart from "./LineChart.vue";
import axios from "axios";

export default {
  name: "ConverterComponent",
  components: {
    LineChart,
  },
  data() {
    return {
      res: [],
      label: "BTC to USD",
      convertedAmount: 1,
      convertionResult: '',
      convertedFrom: "BTC",
      convertedTo: "USD",
      exchangeRate: '',
      coinsCurrencies: {
        BTC: { from: "bitcoin", to: "btc" },
        USD: { to: "usd" },
        ETH: { from: "ethereum", to: "eth" },
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
      colors: {
        borderColor: "#077187",
        pointBorderColor: "#0E1428",
        pointBackgroundColor: "#AFD6AC",
      },
    };
  },
  async created() {
      await this.getMarketChart('bitcoin', 'usd')
      await this.getExchangeRate('bitcoin', 'usd');
      this.convertionResult = this.convertedAmount*this.exchangeRate;
  },
  methods: {
    async getMarketChart(coin, currency){
      this.res = []; //запускает ререндер графика
      await axios
        .get(
          `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=${currency}&days=14&interval=daily`
        )
        .then((response) => {
          response.data.prices.pop();
          response.data.prices.map((entry) => {
            entry[0] = new Date(entry[0]);
            entry[0] = `${entry[0].getDate()}.${
              entry[0].getMonth() > 10
                ? entry[0].getMonth()
                : "0" + entry[0].getMonth()
            }.${entry[0].getFullYear().toString().substr(2)}`;
          });
          this.res = response.data.prices;
        });
    },
    async getExchangeRate(from, to){
      this.exchangeRate = '';
      await axios
        .get(`https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`)
        .then((response) => {
          this.exchangeRate = response.data[from][to]
        })
    },
    convert(amount){
      amount = amount > 0 ? amount : 1;
      this.convertedAmount = amount;
      this.convertionResult = this.convertedAmount*this.exchangeRate;
    }
  },
  watch: {
    async convertedFrom(newValue, oldValue) {
      if (newValue === this.convertedTo) {
        //меняет местами валюты
        this.convertedTo = oldValue;
        this.exchangeRate = this.convertedAmount/this.exchangeRate;
        this.convertionResult = this.convertedAmount*this.exchangeRate;
      } else {
        this.label = `${this.convertedFrom} to ${this.convertedTo}`;
        if (newValue !== "USD") {
          this.getMarketChart(this.coinsCurrencies[newValue].from, this.coinsCurrencies[this.convertedTo].to);
          await this.getExchangeRate(this.coinsCurrencies[newValue].from, this.coinsCurrencies[this.convertedTo].to);
          this.convertionResult = this.convertedAmount*this.exchangeRate;
        } else {
          this.getMarketChart(this.coinsCurrencies[this.convertedTo].from, this.coinsCurrencies[newValue].to);
          await this.getExchangeRate(this.coinsCurrencies[this.convertedTo].from, this.coinsCurrencies[newValue].to);
          this.exchangeRate = this.convertedAmount/this.exchangeRate;
          this.convertionResult = this.convertedAmount*this.exchangeRate;
        }
      }
    },
    async convertedTo(newValue, oldValue){
      if (newValue === this.convertedFrom) {
        //меняет местами валюты
        this.convertedFrom = oldValue;//обновляет convertedFrom, тем самым запуская его watcher, обновляющий курс
      } else {
        this.label = `${this.convertedFrom} to ${this.convertedTo}`;
        if (this.convertedFrom !== "USD") {//если конвертируем не из долларов
          this.getMarketChart(this.coinsCurrencies[this.convertedFrom].from, this.coinsCurrencies[newValue].to);
          await this.getExchangeRate(this.coinsCurrencies[this.convertedFrom].from, this.coinsCurrencies[newValue].to);
          this.convertionResult = this.convertedAmount*this.exchangeRate;
        } else {
          this.getMarketChart(this.coinsCurrencies[newValue].from, this.coinsCurrencies[this.convertedFrom].to);
          await this.getExchangeRate(this.coinsCurrencies[newValue].from, this.coinsCurrencies[this.convertedFrom].to);
          this.exchangeRate = this.convertedAmount/this.exchangeRate;
          this.convertionResult = this.convertedAmount*this.exchangeRate;
        }
      }
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
