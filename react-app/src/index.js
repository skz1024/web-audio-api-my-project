import React, { createRef, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/* 참고사항
javascript로 선언된 변수를 밑에있는 react의 MainBox에서 사용하기 위해서는,
javascript변수들을 reactDom.render를 호출하기 전에 선언해야 합니다.
이 순서를 바꾸게되면, 해당 변수들을 사용할 수 없습니다.
아마도, reactDom.render코드가 앞에 있으면, 그 코드를 먼저 실행해서 이것저것을 추적한 다음
밑에있는 코드가 실행되는것으로 보입니다.
가능하다면, react component 에서 javascript 변수를 직접 사용할거라면,
무조건 javascript 변수를 선언한 후에, reactDom.render를 호출하세요.

react 코드는 밑에 있습니다.
*/
let audioContext = new AudioContext()
let fileName = 'devilish - 05 - Stage 2 - Clock Tower.mp3'
let audio = new Audio(fileName)
audio.loop = true

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
  echoGain.gain.value = 0.5
  let echoDelay = audioContext.createDelay(1)
  echoDelay.delayTime.value = 0.25
  let echoFeedbackGain = audioContext.createGain()
  echoFeedbackGain.gain.value = 0.5
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
  let setEqualizer = function (hzOrIndex, gain) {
    if (gain >= 2) gain = 2

    // hzOrIndex가 배열의 길이를 넘으면 hz값 형태로 인식하게 만듬.
    let setHzIndex = hzOrIndex > hzGain.length ? setHz.indexOf(hzOrIndex) : hzOrIndex
    if (setHzIndex !== -1) {
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
      default: break
    }
  }
  let setEchoPercent = function (type, percent) {
    if (percent >= 200) percent = 200
    let inputGain = (percent / 100) * 0.5
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

ReactDOM.render(
  <React.StrictMode>
    <MainBox></MainBox>
  </React.StrictMode>,
  document.getElementById('root')
);
// react 코드는 밑에 있음.

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

function MainBox () {
  function getAudioCurrentTimePercent () {
    return audio.currentTime / audio.duration * 100
  }

  function getAudioTime () {
    // 오디오 시간에 표시할 내용
    let percent = (audio.currentTime / audio.duration) * 100
    let outputText = `${audio.currentTime.toFixed(2)} / ${audio.duration.toFixed(2)} (${percent.toFixed(2)}%)`
    return outputText
  }

  function getAudioName () {
    return fileName
  }

  function audioPlay () {
    audioContext.resume()
    audio.play()
  }

  function audioStop () {
    audio.pause()
    audioContext.suspend()
    audio.currentTime = 0
  }

  function audioPause () {
    audio.pause()
  }

  // react 에서 실시간으로 오디오 재생 시간을 표시하려면
  // useState를 이용해서 임의의 state변수를 만든 다음에
  let [audioCurrentTime, setAudioCurrentTime] = useState(audio.currentTime)
  let [numberTest, setNumberTest] = useState(0)

  // useEffect를 사용해야합니다. useEffect함수 내에서 animation 함수를 정의하고, 
  // animation함수에 state를 변경하는 함수를 사용합니다.
  // 그리고 매우 중요한건, 무조건 cancleAnimationFrame을 호출해야합니다.
  // react는 매 프레임마다 랜더링을 시도하고, 이로인해 새로운 애니메이션 프레임이 지속적으로 생성됩니다.
  // 만약 애니메이션프레임을 취소하지 않으면, 에니메이션이 중첩 생성되어 메모리 누수가 발생합니다.
  // 이것은 animationFrame 실행 도중 렉이 심하게 걸려 우연히 알아낸 정보입니다.
  useEffect(() => {
    // 에니메이션을 적용할 함수
    function animation () {
      setAudioCurrentTime(audio.currentTime) // 오디오 시간 생태 변수 설정

      // state값 강제 변경으로 에니메이션 호출(react는 state가 변화하지 않으면 렌더링을 하지 않습니다.)
      // setAudioCurrentTime의 경우 audio.currentTime이 변화하지 않을 때(오디오 정지 상태)
      // 어떠한 변화도 일어나지 않습니다. 따라서 임이의 state변수를 조작해야합니다.
      setNumberTest(numberTest + 1)

      // javasciprt에서는 requestAnimationFrame를 재귀호출을 해야 에니메이션이 지속적으로 출력됩니다.
      // 그러나 react에서는 state변수값을 바꾸면 알아서 리렌더링해서, 굳이 requestAnimationFrame을 재귀호출할 필요는 없습니다.
      // 그래도 일단 재귀호출 코드는 javascript에서 사용하던 방식을 유지하기 위해서 유지하겠습니다.
      requestAnimationFrame(animation)
    }

    // cancleAnimationFrame을 하기 위한 ID도 얻어와야 합니다.
    let animationId = requestAnimationFrame(animation)

    // 무조건 cancleAnimationFrame을 호출해야만, 리렌더링으로 인한 메모리 누수가 발생하지 않습니다.
    return () => {cancelAnimationFrame(animationId)}
  }, [setAudioCurrentTime, audioCurrentTime, numberTest])


  // 이 함수는 TimeBox에서 호출할 함수입니다.
  // setAudioTimePercent 속성값으로 함수 이름을 건네주면,
  // 자식 컴포넌트에서 props.setAudioTimePercent 함수를 호출할 때 이 함수를 사용하게 됩니다.
  function setAudioTimePercent (percent) {
    audio.currentTime = audio.duration * percent
  }

  // 오디오 박스의 데이터를 변경합니다.
  function audioBoxChange (boxType, boxValue, gainPercent) {
    if (boxType === 'equalizer-box') {
      let hzValue = parseInt(boxValue)
      audioBox.setEqualizerPercent(hzValue, gainPercent)
    } else if (boxType === 'echo-box') {
      audioBox.setEchoPercent(boxValue, gainPercent)
    } else if (boxType === 'master-box') {
      audioBox.setMasterGainPercent(gainPercent)
    }
  }

  return (
    <div className='main-box'>
      <TimeBox 
        audioCurrentTimePercent={getAudioCurrentTimePercent()}
        timeBoxName={getAudioName()}
        timeBoxTime={getAudioTime()}
        setAudioTimePercent={setAudioTimePercent}
      />
      <MenuBox
        audioPlay={audioPlay}
        audioPause={audioPause}
        audioStop={audioStop}
      />
      <AdvanceBox
        audioBoxChange={audioBoxChange}
      />
    </div>
  )
}

function TimeBox (props) {
  let timeBoxBackgroundRef = useRef() // .timeBoxBackground의 dom 객체
  let timeBoxMeterRef = useRef()
  let timeBoxCircleRef = useRef()
  let [isChange, setIsChange] = useState(false)

  function eventMouseDown (e) {
    // react는 전용 이벤트 객체가 있습니다. 그런데 react의 마우스 이벤트는 offsetX가 없습니다.
    // 대신에 nativeEvenet.offsetX 를 사용하면 됩니다.
    setIsChange(true)
    percentChange(e.nativeEvent.offsetX)
  }

  function eventMouseUp () {
    setIsChange(false)
  }

  function eventMouseMove (e) {
    if (isChange) {
      percentChange(e.nativeEvent.offsetX)
    }
  }

  function percentChange (mouseOffset) {
    // 아까 사용한 useRef로 current객체로 timeBoxBackgroundRef에 접근을 해서 해당 객체에 직접 접근을 할 수 있습니다.
    let percent = mouseOffset / timeBoxBackgroundRef.current.clientWidth
    props.setAudioTimePercent(percent)
  }

  function timeBoxMeterDisplay () {
    // 원래는 getComputedStyle을 이용해서 직접 css width 값을 불러왔으나
    // 생각해보니까 부모의 position이 relative라 %값만 가지고도 div의 위치를 조정할 수가 있어
    // 기존 코드를 삭제하고 %값 으로만 css의 위치값을 변경하였습니다.

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
    let circlePercent = props.audioCurrentTimePercent - CIRCLE_HALF_PERCENT
    if (circlePercent > 100 - CIRCLE_WIDTH_PERCENT) {
      circlePercent = 100 - CIRCLE_WIDTH_PERCENT
    } else if (circlePercent < 0) {
      circlePercent = 0
    }
  
    // 계산한 위치값을 css의 style을 통해 수정합니다.
    timeBoxCircleRef.current.style.left = circlePercent + '%'
    timeBoxMeterRef.current.style.width = props.audioCurrentTimePercent  + '%'
  }

  useEffect(() => {
    timeBoxMeterDisplay()
  })

  return (
    <div className='time-box'>
      <div className='time-box-name'>{props.timeBoxName}</div>
      <div className='time-box-time'>{props.timeBoxTime}</div>
      <div className='time-box-background' 
        onMouseDown={eventMouseDown} 
        onMouseMove={eventMouseMove} 
        onMouseUp={eventMouseUp} 
        ref={timeBoxBackgroundRef}
      >
        <div className='time-box-meter' ref={timeBoxMeterRef}></div>
        <div className='time-box-circle' ref={timeBoxCircleRef}></div>
      </div>
    </div>
  )
}

function MenuBox (props) {
  // image파일을 불러오려면 public 폴더에 이미지를 넣어야합니다.
  // 만약 src 경로에 넣게되면, import를 이용해 이미지 파일을 불러온 후 추가적인 코드를 작성해야 합니다.
  // 만약, 자식 컴포넌트에서 부모 컴포넌트 함수를 호출하려고 한다면,
  // 부모 컴포넌트에서 속성명을 입력한다면, 자식은 props.속성명으로 호출합니다. 함수를 호출하는 ()를 붙이지 않습니다.
  return (
    <div className='menu-box'>
      <button className="menu-play"><img src="menu-play.png" alt="" onClick={props.audioPlay}/></button>
      <button className="menu-pause"><img src="menu-pause.png" alt="" onClick={props.audioPause}/></button>
      <button className="menu-stop"><img src="menu-stop.png" alt="" onClick={props.audioStop}/></button>
    </div>
  )
}

function AdvanceBox (props) {
  // 하위 컴포넌트에 props로 boxType, boxValue를 전달해서 각 컴포넌트가 고유한 클래스 이름을 가지도록 했습니다.
  // boxType: equalizer-box, echo-box 같은 box 종류
  // boxValue: 같은 box type들을 서로 구분하는 값
  // boxText: 해당 박스 밑부분에 출력할 글자
  return (
    <div className='advance-box'>
      <MeterBox boxType="equalizer-box" boxValue="70hz" boxText="70" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="150hz" boxText="150" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="300hz" boxText="300" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="600hz" boxText="600" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="1500hz" boxText="1.5k" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="3000hz" boxText="3k" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="6000hz" boxText="6k" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="equalizer-box" boxValue="12000hz" boxText="12k" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="echo-box" boxValue="echo" boxText="echo" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="echo-box" boxValue="feedback" boxText="fb" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="echo-box" boxValue="convolver" boxText="con" audioBoxChange={props.audioBoxChange}></MeterBox>
      <MeterBox boxType="master-box" boxValue="volume" boxText="vol" audioBoxChange={props.audioBoxChange}></MeterBox>
    </div>
  )
}

function MeterBox (props) {
  let [isChange, setIsChange] = useState(false)
  let meterBoxRef = useRef()
  let meterBoxMeterRef = useRef()
  let meterBoxCircleRef = useRef()
  
  // timeBox에서 사용했던 방식과 완전히 동일합니다. 다만 meterBox는 Y축으로 percent를 계산합니다.
  function eventMouseDown (e) {
    setIsChange(true)
    meterChange(e.nativeEvent.offsetY)
  }

  function eventMouseMove (e) {
    if (isChange) {
      meterChange(e.nativeEvent.offsetY)
    }
  }

  function eventMouseUp () {
    setIsChange(false)
  }

  function meterChange (mouseOffsetY) {
    // 값이 1 - (mouseOffsetY / box.clientHeight) 인 이유는 아래서부터 그래프값이 증가해야 하기 때문입니다.
    // timeBox랑 동일한 형식으로, ref를 통해 가져온 Dom은 current 객체를 사용해서 기능을 사용합니다.
    let percent = (1 - (mouseOffsetY / meterBoxRef.current.clientHeight)) * 100

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

    meterBoxMeterRef.current.style.height = percent + '%'
    meterBoxCircleRef.current.style.bottom = circlePercent + '%'
    
    // 수정했던 percent정보를 다시 부모객체에 순차적으로 넘기고,
    // 이를 이용하여 오디오박스의 내용을 수정합니다.
    props.audioBoxChange(props.boxType, props.boxValue, percent)
    
    // 참고사항: 여기서 setState를 통해 값을 바꾼후 해당 state의 값을 전달하는것은 비추천합니다.
    // 왜냐하면 state를 이 함수 내에서 바꿀경우, 이 값이 반영되려면 랜더링이 새로 끝나야합니다.
    // 굳이 그래야겠다면 이 함수를 useCallback하던가, useEffect안에 이 함수를 넣으세요.
  }

  // 전달받은 props의 정보로 JSX 표현식을 이용해 
  // meter, circle 이름을 조합하여 해당 스타일을 적용할 수 있도록 했습니다.
  // 이것은 모든 box의 class 이름 규칙이 동일하기 때문에 가능합니다.
  let classNameValue = props.boxType + '-' + props.boxValue
  return (
    <div className={classNameValue}
      onMouseDown={eventMouseDown}
      onMouseMove={eventMouseMove}
      onMouseUp={eventMouseUp}
      ref={meterBoxRef}
    >
      <div className={classNameValue + '-meter'} ref={meterBoxMeterRef}></div>
      <div className={classNameValue + '-circle'} ref={meterBoxCircleRef}></div>
      <div className='box-text'>{props.boxText}</div>
    </div>
  )
}
