<template>
  <div class="ConverterComponent">
    <div class="CurrencyConverter" v-if="res.length > 0">
      <div class="CurrencyConverterSelect" v-if="res.length > 0">
        <div class="ConvertedFrom">
          <input
            type="number"
            class="ConvertedFromInput"
            v-model.number="convertedAmount"
          />
          <select
            name="convertedFrom"
            id="convertedFromSelector"
            class="ConvertionSelector"
            @change="convertedFrom = $event.target.value"
            :value="convertedFrom"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ether (ETH)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>
        <p>=</p>
        <div class="ConvertedTo">
          <label class="ConvertedToLabel" for="convertedToSelector">{{
            convertionResult
          }}</label>
          <select
            name="convertedTo"
            id="convertedToSelector"
            class="ConvertionSelector"
            @change="convertedTo = $event.target.value"
            :value="convertedTo"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ether (ETH)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>
      </div>
      <button class="ConvertButton" @click="convert()">Конвертировать</button>
    </div>

    <!-- для того, чтобы настроить размеры графика, необходимо прописать position:relative -->
    <LineChart
      class="MarketRateChart"
      v-if="res.length > 0"
      :chartData="res"
      :options="chartOptions"
      :chartColors="colors"
      :label="label"
    />
    <div class="loader" v-else>Загрузка...</div>
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
      convertionResult: "",
      convertedFrom: "BTC",
      convertedTo: "USD",
      exchangeRate: "",
      coinsCurrencies: {
        BTC: { from: "bitcoin", to: "btc" },
        USD: { to: "usd" },
        ETH: { from: "ethereum", to: "eth" },
      },
      portfolio: {},
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
    await this.getMarketChart("bitcoin", "usd");
    await this.getExchangeRate("bitcoin", "usd");
    this.convertionResult = this.convertedAmount * this.exchangeRate;
    this.portfolio = this.$store.getters.getPortfolio;
  },
  methods: {
    async getMarketChart(coin, currency) {
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
    convert() {
      if (this.portfolio[this.convertedFrom] < this.convertedAmount) {
        /*минимальное значение convertedAmount - 1, 
        но у пользователя может не быть данной валюты вовсе */
        alert("Ошибка: недостаточно валюты");
      } else {
        this.portfolio[this.convertedFrom] -= this.convertedAmount;
        this.portfolio[this.convertedTo] += this.convertionResult;
        this.$store.dispatch("setPortfolio_action", this.portfolio);
        this.convertedAmount = 1;
        this.convertionResult = this.convertedAmount * this.exchangeRate;
      }
      this.$router.push("/portfolio");
    },
  },
  watch: {
    async convertedFrom(newValue, oldValue) {
      if (newValue === this.convertedTo) {
        //меняет местами валюты
        this.convertedTo = oldValue;
        this.exchangeRate = this.convertedAmount / this.exchangeRate;
        this.convertionResult = this.convertedAmount * this.exchangeRate;
      } else {
        if (newValue !== "USD") {
          this.label = `${this.convertedFrom} to ${this.convertedTo}`;
          this.getMarketChart(
            this.coinsCurrencies[newValue].from,
            this.coinsCurrencies[this.convertedTo].to
          );
          await this.getExchangeRate(
            this.coinsCurrencies[newValue].from,
            this.coinsCurrencies[this.convertedTo].to
          );
          this.convertionResult = this.convertedAmount * this.exchangeRate;
        } else {
          this.label = `${this.convertedTo} to ${this.convertedFrom}`;
          this.getMarketChart(
            this.coinsCurrencies[this.convertedTo].from,
            this.coinsCurrencies[newValue].to
          );
          await this.getExchangeRate(
            this.coinsCurrencies[this.convertedTo].from,
            this.coinsCurrencies[newValue].to
          );
          this.exchangeRate = this.convertedAmount / this.exchangeRate;
          this.convertionResult = this.convertedAmount * this.exchangeRate;
        }
      }
    },
    async convertedTo(newValue, oldValue) {
      if (newValue === this.convertedFrom) {
        //меняет местами валюты
        this.convertedFrom = oldValue; //обновляет convertedFrom, тем самым запуская его watcher, обновляющий курс
      } else {
        if (this.convertedFrom !== "USD") {
          //если конвертируем не из долларов
          this.label = `${this.convertedFrom} to ${this.convertedTo}`;
          this.getMarketChart(
            this.coinsCurrencies[this.convertedFrom].from,
            this.coinsCurrencies[newValue].to
          );
          await this.getExchangeRate(
            this.coinsCurrencies[this.convertedFrom].from,
            this.coinsCurrencies[newValue].to
          );
          this.convertionResult = this.convertedAmount * this.exchangeRate;
        } else {
          this.label = `${this.convertedTo} to ${this.convertedFrom}`;
          this.getMarketChart(
            this.coinsCurrencies[newValue].from,
            this.coinsCurrencies[this.convertedFrom].to
          );
          await this.getExchangeRate(
            this.coinsCurrencies[newValue].from,
            this.coinsCurrencies[this.convertedFrom].to
          );
          this.exchangeRate = this.convertedAmount / this.exchangeRate;
          this.convertionResult = this.convertedAmount * this.exchangeRate;
        }
      }
    },
    convertedAmount(newValue, oldValue) {
      if (newValue < 1) {
        this.convertedAmount = oldValue;
      } else {
        if (newValue > this.portfolio[this.convertedFrom]) {
          this.convertedAmount = this.portfolio[this.convertedFrom];
        }
      }
      this.convertionResult = this.convertedAmount * this.exchangeRate;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ConverterComponent {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.CurrencyConverter {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  margin-bottom: 2%;
}

.CurrencyConverterSelect {
  min-width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  margin-right: 1%;
}

.ConvertedFrom,
.ConvertedTo {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  border: 1px solid black;
  border-radius: 10px;
  padding: 5px;
  margin: 1%;
}

.ConvertedFromInput {
  width: 40%;
}

.ConvertedToLabel {
  width: 50%;
  min-width: fit-content;
  margin-right: 2%;
}

.ConvertionSelector {
  width: 10%;
  min-width: fit-content;
  height: 30px;
  background: none;
  border: none;
  border-left: 1px solid black;

  cursor: pointer;
}

.ConvertButton {
  min-width: fit-content;
  background: none;
  border: 1px solid black;
  border-radius: 10px;
  padding: 0.5%;

  cursor: pointer;
}

.MarketRateChart {
  position: relative;

  width: 100%;
}

@media screen and (max-width: 550px) {
  .CurrencyConverter {
    flex-direction: column;

    margin-bottom: 5%;
  }

  .CurrencyConverterSelect {
    flex-direction: column;
    margin-right: 0;
    margin-bottom: 5%;
  }

  .ConvertButton{
    padding: 3%;
  }

  .MarketRateChart {
    position: relative;
    width: 100vw;
  }
}
</style>
