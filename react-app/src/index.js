import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <MainBox></MainBox>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

function MainBox () {
  return (
    <div className='main-box'>
      <TimeBox></TimeBox>
      <MenuBox></MenuBox>
      <AdvanceBox></AdvanceBox>
    </div>
  )
}

function TimeBox () {
  return (
    <div className='time-box'>
      <div className='time-box-name'></div>
      <div className='time-box-time'></div>
      <div className='time-box-background'>
        <div className='time-box-meter'></div>
        <div className='time-box-circle'></div>
      </div>
    </div>
  )
}

function MenuBox () {
  // image파일을 불러오려면 public 폴더에 이미지를 넣어야합니다.
  // 만약 src 경로에 넣게되면, import를 이용해 이미지 파일을 불러온 후 추가적인 코드를 작성해야 합니다.
  return (
    <div className='menu-box'>
      <button className="menu-play"><img src="menu-play.png" alt=""/></button>
      <button className="menu-pause"><img src="menu-pause.png" alt=""/></button>
      <button className="menu-stop"><img src="menu-stop.png" alt=""/></button>
    </div>
  )
}

function AdvanceBox () {
  // 하위 컴포넌트에 props로 boxType, boxValue를 전달해서 각 컴포넌트가 고유한 클래스 이름을 가지도록 했습니다.
  // boxType: equalizer-box, echo-box 같은 box 종류
  // boxValue: 같은 box type들을 서로 구분하는 값
  // boxText: 해당 박스 밑부분에 출력할 글자
  return (
    <div className='advance-box'>
      <MeterBox boxType="equalizer-box" boxValue="70hz" boxText="70"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="150hz" boxText="150"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="300hz" boxText="300"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="600hz" boxText="600"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="1500hz" boxText="1.5k"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="3000hz" boxText="3k"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="6000hz" boxText="6k"></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="12000hz" boxText="12k"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="volume" boxText="echo"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="feedback" boxText="fb"></MeterBox>
      <MeterBox boxType="echo-box" boxValue="convolver" boxText="con"></MeterBox>
      <MeterBox boxType="master-box" boxValue="volume" boxText="vol"></MeterBox>
    </div>
  )
}

function MeterBox (props) {
  // 전달받은 props의 정보로 JSX 표현식을 이용해 
  // meter, circle 이름을 조합하여 해당 스타일을 적용할 수 있도록 했습니다.
  // 이것은 모든 box의 class 이름 규칙이 동일하기 때문에 가능합니다.
  let classNameValue = props.boxType + '-' + props.boxValue
  return (
    <div className={classNameValue}>
      <div className={classNameValue + '-meter'}></div>
      <div className={classNameValue + '-circle'}></div>
      <div className='box-text'>{props.boxText}</div>
    </div>
  )
}

// audio context 관련
// 참고로 audioFile은 src가 아닌 public에 있어야 합니다.
// src에다가 음악 파일을 넣어야만 한다면 추가로 import 과정이 필요한데 복잡해서 안함.
let fileName = '04 - Stage 1 - Graveyard.mp3'
let audio = new Audio(fileName)

// button을 눌렀을 때 동작하는 함수들...
let playButton = document.querySelector('.menu-play')
playButton.addEventListener('click', (e) => {
  audioContext.resume()
  audio.play()
})

let pauseButton = document.querySelector('.menu-pause')
pauseButton.addEventListener('click', (e) => {
  audio.pause()
})

let stopButton = document.querySelector('.menu-stop')
stopButton.addEventListener('click', (e) => {
  audioContext.suspend()
  audio.pause()
  audio.currentTime = 0
})

// web audio api
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


// timeBox 관련 변수들...
let timeBoxTime = document.querySelector('.time-box-time')

let timeBoxMeter = document.querySelector('.time-box-meter')
let timeBoxBackground = document.querySelector('.time-box-background')
let timeBoxCircle = document.querySelector('.time-box-circle')

// 화면에 출력할 내용을 실시간으로 표시합니다. 
// requestAnimationFrame을 사용하면 브라우저가 알아서 일정시간마다 화면을 갱신해줍니다.
function animation () {
  // 보정치 계산: 시간 미터바에 있는 원형모양의 위치를 조절하기 위해 css의 값을 computedStyle 함수를 이용해 가져와 계산합니다.
  // 그 다음 화면 바깥으로 원형모양을 나가지 않게 하도록 위치를 조정해두었습니다.
  // 보정치: timeBoxCircle의 width 나누기 2
  // leftPixel: 해당 픽셀만큼 원형을 왼쪽으로 이동시켜서 막대바의 끝부분에 가운데에 위치하도록 했습니다.
  let correction = parseFloat(getComputedStyle(timeBoxCircle).width) / 2
  let leftPixel = parseFloat(getComputedStyle(timeBoxMeter).width) - correction
  if (leftPixel < 0) {
    leftPixel = 0
  } else if (leftPixel > parseFloat(getComputedStyle(timeBoxBackground).width) - (correction * 2)) {
    leftPixel = parseFloat(getComputedStyle(timeBoxBackground).width) - (correction * 2)
  }

  // 계산한 위치값을 css의 style을 통해 수정합니다.
  timeBoxCircle.style.left = leftPixel + 'px'
  let percent = (audio.currentTime / audio.duration) * 100
  timeBoxMeter.style.width = percent + '%'

  // 실시간 텍스트 내용의 변경
  let outputText = `${audio.currentTime.toFixed(2)} / ${audio.duration.toFixed(2)} (${percent.toFixed(2)}%)`
  timeBoxTime.textContent = outputText

  // audioContext 관련
  for (let i = 0; i < equalizerDiv.gain.length; i++) {
    audioBox.hzGain[i].gain.value = equalizerDiv.gain[i]
  }
  audioBox.echoConvolverGain.gain.value = echoDiv.value.convolverGain
  audioBox.echoFeedbackGain.gain.value = echoDiv.value.feedback
  audioBox.echoGain.gain.value = echoDiv.value.gain
  audioBox.masterGain.gain.value = masterDiv.value.gain
  requestAnimationFrame(animation) // requestAnimation 함수는 재귀호출을 해야 실시간으로 함수를 불러올 수 있습니다.
}
requestAnimationFrame(animation)

// 시간박스의 값 변경을 허용하는지 알아보는 변수입니다.
// 마우스 클릭을 하거나 클릭을 한 상태에서 드래그하면 시간박스의 값 변경을 허용합니다.
let isTimeBoxBackgroundChange = false
timeBoxBackground.addEventListener('mousedown', (e) => {
  isTimeBoxBackgroundChange = true
  if (isTimeBoxBackgroundChange) {
    timeBoxMeterChange(e.offsetX)
  }
})
timeBoxBackground.addEventListener('mouseup', (e) => {
  isTimeBoxBackgroundChange = false
})
timeBoxBackground.addEventListener('mousemove', (e) => {
  if (isTimeBoxBackgroundChange) {
    timeBoxMeterChange(e.offsetX)
  }
})

function timeBoxMeterChange (mouseOffsetX) {
  let percent = mouseOffsetX / timeBoxBackground.clientWidth
  audio.currentTime = (audio.duration * percent)
}

let timeBoxName = document.querySelector('.time-box-name')
timeBoxName.textContent = fileName

// 이퀄라이저 객체 변수를 생성합니다.
// css 쿼리를 불러오는데 반복되는 구문이 많아 반복문으로 코드길이를 줄였습니다.
let equalizerDiv = createEqualizer()
function createEqualizer () {
  const setHz = [70, 150, 300, 600, 1500, 3000, 6000, 12000] // 이퀄라이저의 기본 hz 값입니다.
  let equalizerBox = [] // 상자 쿼리
  let equalizerMeter = [] // 미터 쿼리
  let equalizerCircle = [] // 서클 쿼리(원모양막대)
  let equalizerGain = []

  for (let i = 0; i < 8; i++) {
    // 각 배열의 데이터에 해당 쿼리에 해당하는 div를 객체에 집어넣습니다.
    equalizerBox.push(document.querySelector(`.equalizer-box-${setHz[i]}hz`))
    equalizerMeter.push(document.querySelector(`.equalizer-box-${setHz[i]}hz-meter`))
    equalizerCircle.push(document.querySelector(`.equalizer-box-${setHz[i]}hz-circle`))
    equalizerGain.push(0.5)
    equalizerBox[i].isChange = false

    // 그 다음, addEventListner로 이벤트들을 전부 추가합니다.
    // html javascript 방식과 다르게 react에서 이 객체를 사용할 때
    // addEventListner 내부에서 this는 바인딩 되지 않아 객체에 값을 수정하는 방식으로 변경함.
    equalizerBox[i].addEventListener('mousedown', (e) => {
      equalizerBox[i].isChange = true
      divValueChange(equalizerBox[i], equalizerMeter[i], equalizerCircle[i], e.offsetY)
      equalizerGain[i] = parseFloat(equalizerMeter[i].style.height) / 100
    })
    equalizerBox[i].addEventListener('mousemove', (e) => {
      if (equalizerBox[i].isChange) {
        divValueChange(equalizerBox[i], equalizerMeter[i], equalizerCircle[i], e.offsetY)
        equalizerGain[i] = parseFloat(equalizerMeter[i].style.height) / 100
      }
    })
    equalizerBox[i].addEventListener('mouseup', (e) => {
      equalizerBox[i].isChange = false
    })
  }

  return {
    hz: setHz,
    box: equalizerBox,
    meter: equalizerMeter,
    circle: equalizerCircle,
    gain: equalizerGain
  }
}

function divValueChange(equalizerBox, equalizerMeter, equalizerCircle, mouseOffsetY) {
  let percent = 1 - (mouseOffsetY / equalizerBox.clientHeight)
  let equalizerMaxHeight = parseFloat(getComputedStyle(equalizerBox).height)
  let circleHeight = parseFloat(getComputedStyle(equalizerCircle).height)
  let bottomMax = equalizerMaxHeight
  let bottom = (parseFloat(getComputedStyle(equalizerBox).height) * percent)

  if (bottom + circleHeight >= bottomMax) {
    bottom = bottomMax - circleHeight
  } else if (bottom < 0) {
    bottom = 0
  }

  if (percent <= 0) percent = 0

  equalizerMeter.style.height = (percent * 100) + '%'
  equalizerCircle.style.bottom = bottom + 'px'
}


let echoDiv = createEchoDiv()
function createEchoDiv () {
  let convolverBox = document.querySelector('.echo-box-convolver')
  let convolverMeter = document.querySelector('.echo-box-convolver-meter')
  let convolverCircle = document.querySelector('.echo-box-convolver-circle')
  let gainBox = document.querySelector('.echo-box-volume')
  let gainMeter = document.querySelector('.echo-box-volume-meter')
  let gainCircle = document.querySelector('.echo-box-volume-circle')
  let feedbackGainBox = document.querySelector('.echo-box-feedback')
  let feedbackGainMeter = document.querySelector('.echo-box-feedback-meter')
  let feedbackGainCircle = document.querySelector('.echo-box-feedback-circle')
  let value = { convolverGain: 0.5, gain: 0.25, feedback: 0.25 }

  // html javascript 방식과 다르게 react에서 이 객체를 사용할 때
  // addEventListner 내부에서 this는 바인딩 되지 않아 객체에 값을 수정하는 방식으로 변경함.
  convolverBox.isChange = false
  gainBox.isChange = false
  feedbackGainBox.isChange = false

  convolverBox.addEventListener('mousedown', (e) => {
    convolverBox.isChange = true
    divValueChange(convolverBox, convolverMeter, convolverCircle, e.offsetY)
    value.convolverGain = parseFloat(convolverMeter.style.height) / 100 
  })
  convolverBox.addEventListener('mousemove', (e) => {
    if (convolverBox.isChange) {
      divValueChange(convolverBox, convolverMeter, convolverCircle, e.offsetY)
      value.convolverGain = parseFloat(convolverMeter.style.height) / 100 
    }
  })
  convolverBox.addEventListener('mouseup', (e) => {
    convolverBox.isChange = false
  })

  gainBox.addEventListener('mousedown', (e) => {
    gainBox.isChange = true
    divValueChange(gainBox, gainMeter, gainCircle, e.offsetY)
    value.gain = parseFloat(gainMeter.style.height) / 200 
  })
  gainBox.addEventListener('mousemove', (e) => {
    if (gainBox.isChange) {
      divValueChange(gainBox, gainMeter, gainCircle, e.offsetY)
      value.gain = parseFloat(gainMeter.style.height) / 200 
    }
  })
  gainBox.addEventListener('mouseup', (e) => {
    gainBox.isChange = false
  })

  feedbackGainBox.addEventListener('mousedown', (e) => {
    feedbackGainBox.isChange = true
    divValueChange(feedbackGainBox, feedbackGainMeter, feedbackGainCircle, e.offsetY)
    value.feedback = parseFloat(feedbackGainMeter.style.height) / 200 
  })
  feedbackGainBox.addEventListener('mousemove', (e) => {
    if (feedbackGainBox.isChange) {
      divValueChange(feedbackGainBox, feedbackGainMeter, feedbackGainCircle, e.offsetY)
      value.feedback = parseFloat(feedbackGainMeter.style.height) / 200 
    }
  })
  feedbackGainBox.addEventListener('mouseup', (e) => {
    feedbackGainBox.isChange = false
  })

  return {
    convolverBox: convolverBox,
    convolverMeter: convolverMeter,
    convolverCircle: convolverCircle,
    gainBox: gainBox,
    gainMeter: gainMeter,
    gainCircle: gainCircle,
    feedbackBox: feedbackGainBox,
    feedbackMeter: feedbackGainMeter,
    feedbackCircle: feedbackGainCircle,
    value: value
  }
}

let masterDiv = createMasterDiv()
function createMasterDiv () {
  let box = document.querySelector('.master-box-volume')
  let meter = document.querySelector('.master-box-volume-meter')
  let circle = document.querySelector('.master-box-volume-circle')
  let value = { gain:1 }
  box.isChange = false

  box.addEventListener('mousedown', (e) => {
    box.isChange = true
    divValueChange(box, meter, circle, e.offsetY)
    value.gain = parseFloat(meter.style.height) / 50 
  })
  box.addEventListener('mousemove', (e) => {
    if (box.isChange) {
      divValueChange(box, meter, circle, e.offsetY)
      value.gain = parseFloat(meter.style.height) / 50 
    }
  })
  box.addEventListener('mouseup', (e) => {
    box.isChange = false
  })

  return {
    box: box,
    meter: meter,
    circle: circle,
    value: value
  }
}