<template>
  <div class="main-box">
    <TimeBox :timeBoxName="timeBoxName" :timeBoxTime="timeBoxTime" :audioPercent="audioPercent" @changeAudioPercent="changeAudioPercent" />
    <MenuBox @audioPlay="audioPlay" @audioPause="audioPause" @audioStop="audioStop"/>
    <AdvancBox @audioBoxChange="audioBoxChange"></AdvancBox>
  </div>
</template>

<style src="./index.css"></style>
<script>
// vue 파일을 사용하려면 먼저 import를 해야 합니다. (vue 파일이 있다면 자동완성으로도 지원됨)
import TimeBox from './components/TimeBox.vue'
import MenuBox from './components/MenuBox.vue'
import AdvancBox from './components/AdvanceBox.vue'

let fileName = 'devilish 07 - Stage 4 - Air Passage.mp3'
let audio = new Audio(fileName)
let audioContext = new AudioContext()
// 오디오 컨텍스트를 간편하게 관리하기 위한 팩토리 메소드
let audioBox = createAudioBox()
function createAudioBox () {
  const setHz = [70, 150, 300, 600, 1500, 3000, 6000, 12000] // 기분 hz 값
  let audioElement = audioContext.createMediaElementSource(audio)
  let startGain = audioContext.createGain() // 시작 지점의 게인
  
  // equalizer gain and filter
  let hzGain = []
  let hzFilter = []

  // echo effect
  let echoGain = audioContext.createGain()
  echoGain.gain.value = 0.25
  let echoDelay = audioContext.createDelay(1)
  echoDelay.delayTime.value = 0.25
  let echoFeedbackGain = audioContext.createGain()
  echoFeedbackGain.gain.value = 0.25
  let echoConvolver = audioContext.createConvolver()
  let echoConvolverGain = audioContext.createGain()
  echoConvolverGain.gain.value = 0.5
  let echoConvolverBuffer = audioContext.createBuffer(1, 48000, 48000)
  echoConvolver.buffer = echoConvolverBuffer
  let editBuffer = echoConvolverBuffer.getChannelData(0)
  for (let i = 0; i < editBuffer.length; i++) {
    // convolver buffer를 설정할 때 단순히 Math.random() 으로 하게되면,
    // audio의 일부분을 재생할 때 문제가 되는것을 확인했습니다.
    // 따라서 밑의 공식을 사용해 주세요.
    editBuffer[i] = (1 - (Math.random() * 2)) * (1 - (i / editBuffer.length))
  }
  
  // master gain
  let masterGain = audioContext.createGain()

  // equalizer setting
  // 각 주파수별로 gain과 filter를 제작합니다.
  // 그 다음, 완성된 필터와 게인을 마스터 게인에 연결합니다.
  for (let i = 0; i < 8; i++) {
    hzGain.push(audioContext.createGain())
    hzFilter.push(audioContext.createBiquadFilter())
    hzGain[i].gain.value = 0.5
    hzFilter[i].frequency.value = setHz[i]
    hzFilter[i].type = 'bandpass'

    startGain.connect(hzFilter[i]).connect(hzGain[i]).connect(masterGain) 
  }

  // audioContext link
  // 오디오는 시작게인에 연결되고, 그다음 여러 이펙트들에게 연결되고 마지막엔 마스터게인에 연결됩니다.
  audioElement.connect(startGain)
  startGain.connect(echoDelay).connect(echoGain).connect(masterGain)
  echoDelay.connect(echoFeedbackGain).connect(echoDelay)
  startGain.connect(echoConvolver).connect(echoConvolverGain).connect(masterGain)
  masterGain.connect(audioContext.destination)
  
  // 이퀄라이저를 쉽게 수정하기 위한 함수
  // hzGain[i].gain.value를 통해서도 직접 값을 변경할 수 있지만, 그 과정은 직관적이지 않음.
  // 편의상 hz에 배열의 인덱스를 넣는것도 허용함.
  // 가급적이면 percent함수로 넣는것을 추천...
  let setEqualizer = function (hzOrIndex, gain) {
    if (gain >= 2) gain = 2

    // hzOrIndex가 배열의 길이를 넘으면 hz값 형태로 인식하게 만듬.
    let setHzIndex = hzOrIndex > hzGain.length ? setHz.indexOf(hzOrIndex) : hzOrIndex
    if (setHzIndex != -1) {
      hzGain[setHzIndex].gain.value = gain
    }
  }
  let setEqualizerPercent = function (hzOrIndex, percent) {
    if (percent >= 200) percent = 200
    let inputGain = (percent / 100)
    setEqualizer(hzOrIndex, inputGain)
  }

  // 에코볼륨을 쉽게 수정하기 위한 함수
  // echoGain, echoFeedbackGain, echoVonvolverGain을 통해서도 수정할 수 있지만... 귀찮다.
  let setEcho = function (type, gain) {
    if (gain >= 1) gain = 1

    switch (type) {
      case 'echo': echoGain.gain.value = gain; break
      case 'feedback': echoFeedbackGain.gain.value = gain; break
      case 'convolver': echoConvolverGain.gain.value = gain; break
    }
  }
  let setEchoPercent = function (type, percent) {
    if (percent >= 200) percent = 200

    let inputGain = (percent / 100)
    if (type === 'echo' || type === 'feedback') {
      inputGain *= 0.5
    }
    setEcho(type, inputGain)
  }

  // 마스터게인
  let setMasterGain = function (gain) {
    if (gain >= 2) gain = 2
    masterGain.gain.value = gain
  }
  let setMasterGainPercent = function (percent) {
    percent = percent * 2

    if (percent >= 200) percent = 200
    let inputGain = (percent / 100)
    setMasterGain(inputGain)
  }

  return {
    // 솔직히 말하면, setEqualizer, setEcho, setMasterGain만 리턴해도 되는데... 디버그용으로 남겨둠.
    startGain: startGain,
    audioElement: audioElement,
    hzGain: hzGain,
    hzFilter: hzFilter,
    echoGain: echoGain,
    echoDelay: echoDelay,
    echoFeedbackGain: echoFeedbackGain,
    echoConvolverGain: echoConvolverGain,
    masterGain: masterGain,
    setEqualizer: setEqualizer,
    setEqualizerPercent: setEqualizerPercent,
    setEcho: setEcho,
    setEchoPercent: setEchoPercent,
    setMasterGain: setMasterGain,
    setMasterGainPercent: setMasterGainPercent
  }
}

export default {
  name: 'App',
  data() {
    return {
      timeBoxTime: '',
      timeBoxName: fileName,
      audioPercent: 0,
      audioBox: audioBox,
      animationId: 0
    }
  },
  components: {
    TimeBox,
    AdvancBox,
    MenuBox
  },
  mounted() {
    // vue가 마운트되었을 때 호출되는 함수
    // 여기서 requestAnimationFrame을 호출해야 에니메이션을 사용할 수 있습니다.
    // 이 이외에 다른 곳에서 호출하면 뭔짓을 해도 애니메이션함수를 사용할 수 없음.
    // 내가 이거 찾느라 3시간을 또 날렸다. 정말 빡치는군...
    this.animationId = requestAnimationFrame(this.animation)
  },
  unmounted() {
    cancelAnimationFrame(this.animationId)
    audioContext.close()
  },
  methods: {
    audioPlay: function () {
      audioContext.resume()
      audio.play()
    },
    audioStop: function () {
      audioContext.suspend()
      audio.pause()
      audio.currentTime = 0
    },
    audioPause: function () {
      audio.pause()
    },
    animation: function () {
      let percent = (audio.currentTime / audio.duration) * 100
      let outputText = `${audio.currentTime.toFixed(2)} / ${audio.duration.toFixed(2)} (${percent.toFixed(2)}%)`
      this.timeBoxTime = outputText
      this.audioPercent = percent
      requestAnimationFrame(this.animation)
    },
    changeAudioPercent: function (audioPercent) {
      audio.currentTime = audio.duration * audioPercent / 100
    },
    audioBoxChange: function (boxType, boxValue, gainPercent) {
      if (boxType === 'equalizer-box') {
        let hzValue = parseInt(boxValue)
        audioBox.setEqualizerPercent(hzValue, gainPercent)
      } else if (boxType === 'echo-box') {
        audioBox.setEchoPercent(boxValue, gainPercent)
      } else if (boxType === 'master-box') {
        audioBox.setMasterGainPercent(gainPercent)
      }
    },
  },
}

</script>


