
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "stop|playpause|speak" }] */

const { speechSynthesis, SpeechSynthesisUtterance } = window;

const texttospeak = document.getElementById('texttospeak');
const textbeingspoken = document.getElementById('textbeingspoken');
const marker = document.getElementById('marker');

const range = document.createRange();
let speechtext;
let firstBoundary;

// Was: let voices = [];
const voicesFiltered = [];
function populateVoiceList () {
  const voices = speechSynthesis.getVoices();

  const langFilter = param(/[?&]filter=(\w+)/);
  const langRex = langFilter ? new RegExp('^' + langFilter) : null;
  console.warn('Voice language filter:', langRex);

  const selectElm = document.querySelector('#voice');
  selectElm.innerHTML = '';
  for (let i = 0; i < voices.length; i++) {
    if (langRex && !langRex.test(voices[i].lang)) { continue; }

    voicesFiltered.push(voices[i]);
    const option = document.createElement('option');
    option.innerHTML = voices[i].name + ' (' + voices[i].lang + ')';
    option.setAttribute('value', voices[i].voiceURI);
    option.voice = voices[i];
    if (voices[i].default) { option.selected = true; }
    selectElm.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = populateVoiceList; }

function stop () {
  speechSynthesis.cancel();
}

function playpause () {
  if (speechSynthesis.paused) { speechSynthesis.resume(); } else { speechSynthesis.pause(); }
}

function speak () {
  speechtext = texttospeak.value;
  firstBoundary = true;
  textbeingspoken.textContent = speechtext;

  const utterance = new SpeechSynthesisUtterance(
    document.getElementById('texttospeak').value);
  const voiceIdx = document.getElementById('voice').selectedIndex;
  utterance.voice = voicesFiltered[voiceIdx];
  utterance.volume = document.getElementById('volume').value;
  utterance.pitch = document.getElementById('pitch').value;
  const rate = document.getElementById('rate').value;
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

  console.warn('Utterance:', utterance);

  speechSynthesis.speak(utterance);
}

function handleSpeechEvent (e) {
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
      if (e.name !== 'word') { break; }

      const substr = speechtext.slice(e.charIndex);
      const rex = /\S+/g;
      const res = rex.exec(substr);
      if (!res) return;

      const startOffset = res.index + e.charIndex;
      const endOffset = rex.lastIndex + e.charIndex;
      range.setStart(textbeingspoken.firstChild, startOffset);
      range.setEnd(textbeingspoken.firstChild, endOffset);
      const rect = range.getBoundingClientRect();
      let delta = 0;
      // do I need to scroll?
      const parentRect = textbeingspoken.getBoundingClientRect();
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

function param (regex, def = null) {
  const matches = window.location.search.match(regex);
  return matches ? matches[1] : def;
}
