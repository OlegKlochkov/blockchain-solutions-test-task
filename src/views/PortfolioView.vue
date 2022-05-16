<template>
  <div class="PortfolioView">
    <PortfolioComponent/>
  </div>
</template>

<script>
// @ is an alias to /src
import PortfolioComponent from '@/components/PortfolioComponent.vue'

export default {
  name: 'PortfolioView',
  components: {
    PortfolioComponent
  }
}
</script>

<style scoped>
.PortfolioView{
  width: 80%;
}

@media screen and (max-width: 550px) {
  .PortfolioView{
    width: 100%;
  }
}
</style>