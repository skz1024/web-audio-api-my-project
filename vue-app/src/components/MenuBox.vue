<template>
  <div class="menu-box">
    <button class="menu-play" @click="menuPlay"><img src="menu-play.png" alt=""></button>
    <button class="menu-pause" @click="menuPause"><img src="menu-pause.png" alt=""></button>
    <button class="menu-stop" @click="menuStop"><img src="menu-stop.png" alt=""></button>
  </div>
</template>
<script>
export default {
  methods: {
    // menuBox의 함수들은 부모컨테이너의 App컨텐츠에 있는 함수를 사용합니다.
    // 따라서 emit으로 부모에 호출할 함수 이름을 작성하였습니다.
    menuPlay: function () {
      this.$emit('audioPlay')
    },
    menuPause: function () {
      this.$emit('audioPause')
    },
    menuStop: function () {
      this.$emit('audioStop')
    }
  }
}
</script>