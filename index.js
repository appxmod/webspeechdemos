

var texttospeak = document.getElementById('texttospeak');
var textbeingspoken = document.getElementById('textbeingspoken');
var marker = document.getElementById('marker');
var range = document.createRange();
var speechtext;
var firstBoundary;

var voices = [];
function populateVoiceList() {
  voices = window.speechSynthesis.getVoices();
  var selectElm = document.querySelector('#voice');
  selectElm.innerHTML = '';
  for (var i=0;i < voices.length;i++) {
    var option = document.createElement('option');
    option.innerHTML = voices[i].name + ' (' + voices[i].lang + ')';
    option.setAttribute('value', voices[i].voiceURI);
    option.voice = voices[i];
    if (voices[i].default)
      option.selected = true;
    selectElm.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined)
  speechSynthesis.onvoiceschanged = populateVoiceList;

function stop() {
  speechSynthesis.cancel();
}

function playpause() {
  if (speechSynthesis.paused)
    speechSynthesis.resume();
  else
    speechSynthesis.pause();
}

function speak() {
  speechtext = texttospeak.value;
  firstBoundary = true;
  textbeingspoken.textContent = speechtext;

  utterance = new SpeechSynthesisUtterance(
    document.getElementById('texttospeak').value);
  utterance.voice = voices[document.getElementById('voice').selectedIndex];
  utterance.volume = document.getElementById('volume').value;
  utterance.pitch = document.getElementById('pitch').value;
  var rate = document.getElementById('rate').value;
  utterance.rate = Math.pow(Math.abs(rate) + 1, rate < 0 ? -1 : 1);
  utterance.addEventListener('start', function () {
    marker.classList.remove('animate');
    document.body.classList.add('speaking');
  });
  utterance.addEventListener('start', handleSpeechEvent);
  utterance.addEventListener('end', handleSpeechEvent);
  utterance.addEventListener('error', handleSpeechEvent);
  utterance.addEventListener('boundary', handleSpeechEvent);
  utterance.addEventListener('pause', handleSpeechEvent);
  utterance.addEventListener('resume', handleSpeechEvent);

  speechSynthesis.speak(utterance);
}

function handleSpeechEvent(e) {
  console.log('Speech Event:', e);

  switch (e.type) {
    case 'start':
      marker.classList.remove('animate');
      document.body.classList.add('speaking');
      break;
    case 'end':
    case 'endEvent':
    case 'error':
      document.body.classList.remove('speaking');
      marker.classList.remove('moved');
      break;
    case 'boundary':
    {
      if (e.name != 'word')
        break;
      var substr = speechtext.slice(e.charIndex);
      var rex = /\S+/g;
      var res = rex.exec(substr);
      if (!res) return;
      var startOffset = res.index + e.charIndex;
      var endOffset = rex.lastIndex + e.charIndex;
      range.setStart(textbeingspoken.firstChild, startOffset);
      range.setEnd(textbeingspoken.firstChild, endOffset);
      var rect = range.getBoundingClientRect();
      var delta = 0;
      // do I need to scroll?
      var parentRect = textbeingspoken.getBoundingClientRect();
      if (rect.bottom > parentRect.bottom) {
        delta = rect.bottom - parentRect.bottom;
      }
      if (rect.top < parentRect.top) {
        delta = rect.top - parentRect.top;
      }

      textbeingspoken.scrollTop += delta;
      texttospeak.scrollTop = textbeingspoken.scrollTop;

      marker.style.top = rect.top - delta - 1;
      marker.style.left = rect.left - 1;
      marker.style.width = rect.width + 1;
      marker.style.height = rect.height + 1;
      marker.classList.add('moved');
      if (firstBoundary) {
        firstBoundary = false;
        marker.classList.add('animate');
      }
      break;
    }
    default:
      break;
  }
}
