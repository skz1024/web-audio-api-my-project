<template>
  <div class="main-box">
    <TimeBox :audioName="audioName" :audioTime="audioTime" :audioPercent="audioPercent" @changeAudioPercent="changeAudioPercent"></TimeBox>
    <div class="menu-box">
      <button class="menu-play" @click="menuPlay"><img src="menu-play.png" alt=""></button>
      <button class="menu-pause" @click="menuPause"><img src="menu-pause.png" alt=""></button>
      <button class="menu-stop" @click="menuStop"><img src="menu-stop.png" alt=""></button>
    </div>
    <div class="advance-box">
      <MeterBox boxType="equalizer-box" boxValue="70hz" boxText="70" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="150hz" boxText="150" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="300hz" boxText="300" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="600hz" boxText="600" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="1500hz" boxText="1.5k" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="3000hz" boxText="3k" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="6000hz" boxText="6k" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="12000hz" boxText="12k" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="volume" boxText="echo" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="feedback" boxText="fb" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="convolver" boxText="con" @changeValue="changeValue"></MeterBox>
      <MeterBox boxType="master-box" boxValue="volume" boxText="vol" @changeValue="changeValue"></MeterBox>
    </div>
  </div>
</template>

<style src="./index.css"></style>
<script>
import MeterBox from './components/MeterBox.vue'
import TimeBox from './components/TimeBox.vue'

let fileName = '04 - Stage 1 - Graveyard.mp3'
let audio = new Audio(fileName)
let audioContext = new AudioContext()

let audioBox = createAudioBox()

function createAudioBox () {
  const setHz = [70, 150, 300, 600, 1500, 3000, 6000, 12000]
  let audioElement = audioContext.createMediaElementSource(audio)
  let startGain = audioContext.createGain()
  let hzGain = []
  let hzFilter = []
  let echoGain = audioContext.createGain()
  echoGain.gain.value = 0.25
  let echoDelay = audioContext.createDelay(1)
  echoDelay.delayTime.value = 0.25
  let echoFeedbackGain = audioContext.createGain()
  echoFeedbackGain.gain.value = 0.25
  let echoConvolver = audioContext.createConvolver()
  let echoConvolverGain = audioContext.createGain()
  echoConvolverGain.gain.value = 0.25
  let echoConvolverBuffer = audioContext.createBuffer(1, 48000, 48000)
  let editBuffer = echoConvolverBuffer.getChannelData(0)
  for (let i = 0; i < editBuffer.length; i++) {
    // convolver buffer를 설정할 때 단순히 Math.random() 으로 하게되면,
    // audio의 일부분을 재생할 때 문제가 되는것을 확인했습니다.
    // 따라서 밑의 공식을 사용해 주세요.
    editBuffer[i] = (1 - (Math.random() * 2)) * (1 - (i / editBuffer.length))
  }
  echoConvolver.buffer = echoConvolverBuffer
  let masterGain = audioContext.createGain()
  masterGain.gain.value = 1

  for (let i = 0; i < 8; i++) {
    hzGain.push(audioContext.createGain())
    hzFilter.push(audioContext.createBiquadFilter())
    hzGain[i].gain.value = 0.5
    hzFilter[i].frequency.value = setHz[i]
    hzFilter[i].type = 'bandpass'

    startGain.connect(hzFilter[i]).connect(hzGain[i]).connect(masterGain) 
  }

  audioElement.connect(startGain)
  startGain.connect(echoDelay).connect(echoGain).connect(masterGain)
  echoDelay.connect(echoFeedbackGain).connect(echoDelay)
  // startGain.connect(echoConvolver).connect(masterGain) // 이 기능을 사용할 때 오디오 재생에 일부 문제가 있습니다.
  masterGain.connect(audioContext.destination)

  return {
    startGain: startGain,
    audioElement: audioElement,
    hzGain: hzGain,
    hzFilter: hzFilter,
    echoGain: echoGain,
    echoDelay: echoDelay,
    echoFeedbackGain: echoFeedbackGain,
    echoConvolverGain: echoConvolverGain,
    masterGain: masterGain
  }
}

export default {
  name: 'App',
  data() {
    return {
      audioTime: '',
      audioName: fileName,
      audioPercent: 0,
      audioBox: audioBox
    }
  },
  components: {
    MeterBox,
    TimeBox
  },
  mounted() {
    // vue가 마운트되었을 때 호출되는 함수
    // 여기서 requestAnimationFrame을 호출해야 에니메이션을 사용할 수 있습니다.
    // 이 이외에 다른 곳에서 호출하면 뭔짓을 해도 애니메이션함수를 사용할 수 없음.
    // 내가 이거 찾느라 3시간을 또 날렸다. 정말 빡치는군...
    requestAnimationFrame(this.animation)
  },
  methods: {
    menuPlay: function () {
      audioContext.resume()
      audio.play()
    },
    menuStop: function () {
      audioContext.suspend()
      audio.pause()
      audio.currentTime = 0
    },
    menuPause: function () {
      audio.pause()
    },
    animation: function () {
      let percent = (audio.currentTime / audio.duration) * 100
      let outputText = `${audio.currentTime.toFixed(2)} / ${audio.duration.toFixed(2)} (${percent.toFixed(2)}%)`
      this.audioTime = outputText
      this.audioPercent = percent
      requestAnimationFrame(this.animation)
    },
    changeAudioPercent: function (audioPercent) {
      audio.currentTime = audio.duration * audioPercent
      this.audioTime = audio.currentTime
    },
    changeValue: function (boxType, boxValue, gainValue) {
      if (boxType === 'equalizer-box') {
        this.changeEqualizerValue(boxValue, gainValue)
      } else if (boxType === 'echo-box') {
        this.changeEchoValue(boxValue, gainValue)
      } else if (boxType === 'master-box') {
        this.changeMasterValue(gainValue)
      }
    },
    changeEqualizerValue: function (boxValue, gainValue) {
      if (gainValue >= 2) gainValue = 1
      gainValue = gainValue / 2
      switch (boxValue) {
        case '70hz':
          audioBox.hzGain[0].gain.value = gainValue
          break
        case '150hz':
          audioBox.hzGain[1].gain.value = gainValue
          break
        case '300hz':
          audioBox.hzGain[2].gain.value = gainValue
          break
        case '600hz':
          audioBox.hzGain[3].gain.value = gainValue
          break
        case '1500hz':
          audioBox.hzGain[4].gain.value = gainValue
          break
        case '3000hz':
          audioBox.hzGain[5].gain.value = gainValue
          break
        case '6000hz':
          audioBox.hzGain[6].gain.value = gainValue
          break
        case '12000hz':
          audioBox.hzGain[7].gain.value = gainValue
          break
      }
    },
    changeEchoValue: function (boxValue, gainValue) {
      if (gainValue >= 2) gainValue = 1
      gainValue = gainValue / 2
      switch (boxValue) {
        case 'volume':
          audioBox.echoGain.gain.value = gainValue
          break
        case 'feedback':
          audioBox.echoFeedbackGain.gain.value = gainValue
          break
        case 'convolver':
          audioBox.echoConvolverGain.gain.value = gainValue
          break
      }
    },
    changeMasterValue: function (gainValue) {
      if (gainValue <= 3) gainValue *= 2
      audioBox.masterGain.gain.value = gainValue
    },
  },
  watch: {
    
  }
}


</script>


