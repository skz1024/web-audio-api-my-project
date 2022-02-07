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
  <div v-bind:class="getClassName(boxType, boxValue)" @mousedown="mouseDownEvent" @mousemove="mouseMoveEvent" @mouseup="mouseUpEvent">
    <div v-bind:class="getClassName(boxType, boxValue, 'meter')"></div>
    <div v-bind:class="getClassName(boxType, boxValue, 'circle')"></div>
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
    mouseDownEvent(e) {
      this.isChange = true
      this.changePercent(e)
    },
    mouseUpEvent() {
      this.isChange = false
    },
    mouseMoveEvent(e) {
      if (this.isChange) {
        this.changePercent(e)
      }
    },
    changePercent(e) {
      // className 앞부분에 . 이 붙는것은 css선택자를 사용해서 엘리먼트를 불러오기 때문입니다.
      // 박스 길이를 기준으로, 마우스 클릭한 위치가 어느 퍼센트 구간인지를 계산하는 과정입니다.
      // 이것저것 참고해야할 값들이 많아 공식이 지나치게 복잡해져버렸습니다.
      let className = '.' + this.getClassName(this.boxType, this.boxValue)
      let boxElement = document.querySelector(className)
      let maxHeight = parseFloat(getComputedStyle(boxElement).height)
      let percent = 1 - (e.offsetY / maxHeight)
      let circleClassName = '.' + this.getClassName(this.boxType, this.boxValue, 'circle')
      let circleElement = document.querySelector(circleClassName)
      let circleHeight = parseFloat(getComputedStyle(circleElement).height)
      let bottomPx = (maxHeight * percent)

      // 만약 bottomPx가 영역을 벗어나게 될 경우, bottomPx는 영역을 벗어나지 않도록 조정됩니다.
      if (bottomPx + circleHeight >= maxHeight) {
        bottomPx = maxHeight - circleHeight
      } else if (bottomPx < 0) {
        bottomPx = 0
      }

      // percent가 음수가 되는것을 막습니다.
      if (percent < 0) percent = 0

      let meterClassName = '.' + this.getClassName(this.boxType, this.boxValue, 'meter')
      let meterElement = document.querySelector(meterClassName)
      meterElement.style.height = (percent * 100) + '%'
      circleElement.style.bottom = bottomPx + 'px'

      this.$emit('changeValue', this.boxType, this.boxValue, percent)
    }
  }
}

</script>
<style>
</style>