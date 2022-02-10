참고사항: 약 3시간의 삽질 끝에 알아낸 결론은, 부모 요소에서 props를 사용할 때 v-bind를 사용해야만
props 값을 이용하여 속성에 추가적인 설정을 할 수 있습니다.
즉, 정적 할당으로 가져올 수 없고 동적 할당으로 값을 가져와야 props를 이용하여 class값을 임의로 결정할 수 있습니다.

원래 하려던것은 props를 가져온 후에 이 값들을 조합해 css 선택자를 만드는 것이였습니다.
boxType = "equalizer", boxValue = "70hz" -> equalizer-70hz
위와 같은 형태로 만드려고 하였으나, 도무지 이 두개의 값을 어떻게 속성에 할당해야 하는지를 몰라 3시간동안 지랄을 했습니다.
그러다가 우연히 동적 할당(v-bind)를 하게 되면 자바스크립트의 값을 얻어와 속성값으로 할당할 수 있는걸 알게되었습니다. 
공식문서에 있는것으로 이를 알기는 어려웠으며, 한참을 고민하다가 동적할당을 우연히 사용해보았는데
이 방법으로 자바스크립트 값을 그대로 속성값으로 활용할 수 있습니다.

솔직히 말해서, vuejs는 자바스크립트를 메인으로 써먹기에는 애매하고 진짜로 뷰용도로 사용하는게 맞는것으로 보입니다.
이 부분은 react랑은 많이 달라보이네요.

참고사항 2:
v-bind:class 에다가 = 를 안붙이면 에러남...

<template>
  <div v-bind:class="getClassName(boxType, boxValue)" 
    @mousedown="eventMouseDown" 
    @mousemove="eventMouseMove"
    @mouseup="eventMouseUp"
    @touchstart="eventTouchStart"
    @touchmove="eventTouchMove"
    @touchEnd="eventTouchEnd"
    ref="meterBox">
    <div v-bind:class="getClassName(boxType, boxValue, 'meter')" ref="meterBoxMeter"></div>
    <div v-bind:class="getClassName(boxType, boxValue, 'circle')" ref="meterBoxCircle"></div>
    <div class="box-text">{{boxText}}</div>
  </div>
</template>

<script>
export default {
  props: ['boxType', 'boxValue', 'boxText'],
  data() {
    return {
      heightPercent: 0,
      isChange: false
    }
  },
  methods: {
    getClassName(boxType, boxValue, option = '') {
      if (option != ''){
        return boxType + '-' + boxValue + '-' + option
      } else {
        return boxType + '-' + boxValue
      }
    },
    eventMouseDown(e) {
      this.isChange = true
      this.changePercent(e.offsetY)
    },
    eventMouseUp() {
      this.isChange = false
    },
    eventMouseMove(e) {
      if (this.isChange) {
        this.changePercent(e.offsetY)
      }
    },
    eventTouchStart(e) {
      // torchEvent는 offsetX, offsetY가 없기 때문에 event.target.getBoundingClientRect()를 통해
      // 사각형의 값을 얻어온 후에, 다음과 같은 계산을 해야 합니다.
      // offsetY = e.touches[0].clientY - rect.top
      // 참고: 이 예제는 스크롤을 사용하지 않아서 pageOffsetX를 계산하지 않았습니다.
      const rect = e.target.getBoundingClientRect()
      this.isChange = true
      this.changePercent(e.touches[0].clientY - rect.top)
    },
    eventTouchMove(e) {
      if (this.isChange) {
        const rect = e.target.getBoundingClientRect()
        this.changePercent(e.touches[0].clientY - rect.top)
      }
    },
    eventTouchEnd() {
      this.isChange = false
    },
    changePercent(mouseOffsetY) {
      // 값이 1 - (mouseOffsetY / box.clientHeight) 인 이유는 아래서부터 그래프값이 증가해야 하기 때문입니다.
      let percent = (1 - (mouseOffsetY / this.$refs.meterBox.clientHeight)) * 100

      // CIRCLE_HEIGHT_PERCENT의 값은 css파일에 작성되어있어서, 사용자가 직접 수동으로 값을 넣었습니다.
      const CIRCLE_HEIGHT_PERCENT = 10
      const CIRCLE_HEIGHT_HALF_PERCENT = 5
      let circlePercent = percent - CIRCLE_HEIGHT_HALF_PERCENT

      // 퍼센트가 0미만일경우 오류가 발생하는 경우가 있어, 퍼센트가 0미만이 되지 않도록 했습니다.
      // 그리고 퍼센트의 값이 100을 초과하지 않도록 했습니다.
      if (percent >= 100) {
        percent = 100
      } else if (percent <= 0) {
        percent = 0
      }

      // circle의 위치가 box 영역을 초과할 수 없도록 보정합니다.
      if (circlePercent >= 100 - CIRCLE_HEIGHT_PERCENT) {
        circlePercent = 100 - CIRCLE_HEIGHT_PERCENT
      } else if (circlePercent <= 0) {
        circlePercent = 0
      }

      this.$refs.meterBoxMeter.style.height = percent + '%'
      this.$refs.meterBoxCircle.style.bottom = circlePercent + '%'

      // 부모 요소의 audioBoxChange를 호출하기 위해 emit으로 audioBoxChange 요소 이름을 전달합니다.
      // 이 함수는 meterBox -> advanceBox -> App.Js 순으로 정보를 전달합니다.
      this.$emit('audioBoxChange', this.boxType, this.boxValue, percent)
    }
  }
}

</script>
<style>
</style>