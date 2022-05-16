<script>
import { Pie } from "vue-chartjs";

export default {
  extends: Pie,
  props: {
    label: {
      type: String
    },
    chartData: {
      type: Array
    },
    options: {
      type: Object
    },
    chartColors: {
      type: Array
    }
  },
  mounted() {
    const chartLabels = this.chartData.map(entry => entry[0]);
    const amounts = this.chartData.map(entry => entry[1]);
    console.log(chartLabels);
    console.log(amounts);
    const backgroundColors = this.chartColors;

    this.renderChart(
      {
        labels: chartLabels,
        datasets: [
          {
            data: amounts,
            backgroundColor: backgroundColors
          }
        ]
      },
      this.options
    );
  }
};
</script>