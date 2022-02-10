<template>
  <div class="advance-box">
    <MeterBox boxType="equalizer-box" boxValue="70hz" boxText="70" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="150hz" boxText="150" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="300hz" boxText="300" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="600hz" boxText="600" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="1500hz" boxText="1.5k" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="3000hz" boxText="3k" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="6000hz" boxText="6k" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="equalizer-box" boxValue="12000hz" boxText="12k" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="echo-box" boxValue="echo" boxText="echo" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="echo-box" boxValue="feedback" boxText="fb" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="echo-box" boxValue="convolver" boxText="con" @audioBoxChange="audioBoxChange"></MeterBox>
    <MeterBox boxType="master-box" boxValue="volume" boxText="vol" @audioBoxChange="audioBoxChange"></MeterBox>
  </div>
</template>

<script>
import MeterBox from './MeterBox.vue'
export default {
  components: {
    MeterBox
  },
  methods: {
    // audioBoxChange는 App 객체에 있는 audioBoxChange 함수를 사용합니다.
    // 따라서 emit을 통해 부모요소에게 정보를 전달합니다.
    audioBoxChange: function (boxType, boxValue, gainPercent) {
      this.$emit('audioBoxChange', boxType, boxValue, gainPercent)
    }
  }
}
</script>