<template>
  <div class="time-box" @mousedown="mouseDownEvent" @mousemove="mouseMoveEvent" @mouseup="mouseUpEvent">
    <div class="time-box-name">{{audioName}}</div>
    <div class="time-box-time">{{audioTime}}</div>
    <div class="time-box-background">
      <div class="time-box-meter"></div>
      <div class="time-box-circle"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['audioName', 'audioTime', 'audioPercent'],
  data() {
    return {
      isChange:false,
    }
  },
  mounted() {
    requestAnimationFrame(this.animation)
  },
  methods: {
    mouseDownEvent (e) {
      this.isChange = true
      this.changePercent(e)
    },
    mouseUpEvent () {
      this.isChange = false
    },
    mouseMoveEvent (e) {
      if (this.isChange) {
        this.changePercent(e)
      }
    },
    changePercent (e) {
      let circleElement = document.querySelector('.time-box-circle')
      let circleHalfWidth = parseFloat(getComputedStyle(circleElement).width) / 2
      let meterElement = document.querySelector('.time-box-meter')
      let meterWidth = parseFloat(getComputedStyle(meterElement).width)
      let leftPx = meterWidth - circleHalfWidth
      let boxElement = document.querySelector('.time-box')
      let boxWidth = parseFloat(getComputedStyle(boxElement).width)

      if (leftPx < 0) {
        leftPx = 0
      } else if (leftPx > boxWidth - (circleHalfWidth * 2)) {
        leftPx = boxWidth - (circleHalfWidth * 2)
      }

      // 계산한 위치값을 css의 style을 통해 수정합니다.
      circleElement.style.left = leftPx + 'px'
      let percent = e.offsetX / boxWidth
      meterElement.style.width = (percent * 100) + '%'
      this.$emit('changeAudioPercent', percent)
    },
    animation() {
      let circleElement = document.querySelector('.time-box-circle')
      let circleHalfWidth = parseFloat(getComputedStyle(circleElement).width) / 2
      let meterElement = document.querySelector('.time-box-meter')
      let meterWidth = parseFloat(getComputedStyle(meterElement).width)
      let leftPx = meterWidth - circleHalfWidth
      let boxElement = document.querySelector('.time-box')
      let boxWidth = parseFloat(getComputedStyle(boxElement).width)

      if (leftPx < 0) {
        leftPx = 0
      } else if (leftPx > boxWidth - (circleHalfWidth * 2)) {
        leftPx = boxWidth - (circleHalfWidth * 2)
      }
      
      circleElement.style.left = leftPx + 'px'
      meterElement.style.width = this.audioPercent + '%'
      requestAnimationFrame(this.animation)
    }
  }
}
</script>