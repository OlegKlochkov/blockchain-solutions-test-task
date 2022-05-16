<template>
  <div class="ConverterView">
    <ConverterComponent/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConverterComponent from '@/components/ConverterComponent.vue'

export default {
  name: 'HomeView',
  components: {
    ConverterComponent
  }
}
</script>

<style scoped>
.ConverterView{
  width: 80%;
}
</style>