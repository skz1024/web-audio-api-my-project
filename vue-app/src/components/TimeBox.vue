<template>
  <div class="time-box" 
    @mousedown="eventMouseDown"
    @mousemove="eventMouseMove"
    @mouseup="eventMouseUp"
    @touchstart="eventTouchStart"
    @touchmove="eventTouchMove"
    @touchEnd="eventTouchEnd"
  >
    <div class="time-box-name">{{timeBoxName}}</div>
    <div class="time-box-time">{{timeBoxTime}}</div>
    <div class="time-box-background" ref="timeBox">
      <div class="time-box-meter" ref="timeBoxMeter"></div>
      <div class="time-box-circle" ref="timeBoxCircle"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['timeBoxName', 'timeBoxTime', 'audioPercent'],
  watch: {
    // watch를 사용해서 audioPercent가 변경될 때 timeBox의 막대바가 변경되도록 했습니다.
    audioPercent: function () {
      this.displayTimeBox()
    }
  },
  data() {
    return {
      isChange:false,
    }
  },
  methods: {
    eventMouseDown (e) {
      this.isChange = true
      this.changePercent(e.offsetX)
    },
    eventMouseUp () {
      this.isChange = false
    },
    eventMouseMove (e) {
      if (this.isChange) {
        this.changePercent(e.offsetX)
      }
    },
    eventTouchStart(e) {
      // torchEvent는 offsetX, offsetY가 없기 때문에 event.target.getBoundingClientRect()를 통해
      // 사각형의 값을 얻어온 후에, 다음과 같은 계산을 해야 합니다.
      // offsetX = e.touches[0].clientX - rect.left
      // offsetY = e.touches[0].clientY - rect.top
      // 참고: 이 예제는 스크롤을 사용하지 않아서 pageOffsetX를 계산하지 않았습니다.
      const rect = e.target.getBoundingClientRect()
      this.isChange = true
      this.changePercent(e.touches[0].clientX - rect.left)
    },
    eventTouchMove(e) {
      if (this.isChange) {
        const rect = e.target.getBoundingClientRect()
        this.changePercent(e.touches[0].clientX - rect.left)
      }
    },
    eventTouchEnd() {
      this.isChange = false
    },
    displayTimeBox () {
      // timeboxcircle의 (width percent / 2)의 값 (이 %값은 getComputedStyle로 가져올 수 없음.)
      // inline css를 쓴다면 모르겠으나, css파일로 작성한탓에, %값을 가져올 수 없어 수동으로 집적 값을 넣었습니다.
      const CIRCLE_HALF_PERCENT = 1
      const CIRCLE_WIDTH_PERCENT = 2

      // CIRCLE_HALF_PERCENT는 circle의 위치를 조정하기 위한 %값을 정의하는 변수입니다.
      // 막대바의 중앙에 위치해야 하기 때문에 circle_width % 값을 2로 나눈값을 퍼센트로 적용하였습니다.
      // value / 2 = 중심값
      // 그리고, 정해진 div의 영역을 초과할 수 없게 하기 위해, 
      // circlePercent의 값은 100 - CIRCLE_WIDTH_PERCENT 을 초과할 수 없습니다.
      // 즉, 100%을 초과하면 안됩니다. 0% 미만도 안됩니다.
      let circlePercent = this.audioPercent - CIRCLE_HALF_PERCENT
      if (circlePercent > 100 - CIRCLE_WIDTH_PERCENT) {
        circlePercent = 100 - CIRCLE_WIDTH_PERCENT
      } else if (circlePercent < 0) {
        circlePercent = 0
      }

      // 계산한 위치값을 css의 style을 통해 수정합니다.
      this.$refs.timeBoxCircle.style.left = circlePercent + '%'
      this.$refs.timeBoxMeter.style.width = this.audioPercent + '%'
    },
    changePercent (mouseOffsetX) {
      // 원래는 getComputedStyle을 이용해서 직접 css width 값을 불러왔으나
      // 생각해보니까 부모의 position이 relative라 %값만 가지고도 div의 위치를 조정할 수가 있어
      // 기존 코드를 삭제하고 %값 으로만 css의 위치값을 변경하였습니다.
      let percent = (mouseOffsetX / this.$refs.timeBox.clientWidth) * 100
      this.$emit('changeAudioPercent', percent)
      this.displayTimeBox() // 퍼센트가 변경되면 타임박스의 css값을 수정합니다.
    },
  },
}
</script>