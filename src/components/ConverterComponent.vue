<template>
  <div class="hello">
    <LineChart v-if="res.length > 0" 
      :chartData="res"
      :options="chartOptions"
      :chartColors="colorsBTCtoUSD"
      label ='BTC to USD'
    />
  </div>
</template>

<script>
import LineChart from './LineChart.vue'
import axios from 'axios'

export default {
  name: 'ConverterComponent',
  components: {
    LineChart
  },
  data(){
    return{
      res: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      colorsBTCtoUSD: {
        borderColor: "#077187",
        pointBorderColor: "#0E1428",
        pointBackgroundColor: "#AFD6AC"
      }
    }
  },
  async created(){
    await axios
      .get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=14&interval=daily')
      .then(response => {
        response.data.prices.map(entry => {
          entry[0] = new Date(entry[0]);
          entry[0] = `${entry[0].getDate()}.${entry[0].getMonth() > 10 ? entry[0].getMonth() : '0' + entry[0].getMonth()}.${entry[0].getFullYear().toString().substr(2)}`;
        })
        this.res = response.data.prices;
        console.log(this.res);
        })
  }
}
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
