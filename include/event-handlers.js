
import { stop, playpause, speak, multiTextDemo, param } from './index.js';

const SpeakForm = document.querySelector('#speak-form');
const ResumeForm = document.querySelector('#resume-form');
const CancelForm = document.querySelector('#cancel-form');

const PitchResetBtn = document.querySelector('.pitch-field button');
const RateResetBtn = document.querySelector('.rate-field button');
const VolumeResetBtn = document.querySelector('.volume-field button');
const VoiceResetBtn = document.querySelector('.voice-field button');

SpeakForm.addEventListener('submit', ev => {
  ev.preventDefault();

  const IS_MULTI = !!param(/multi=(1|on)/);
  console.warn('^^^ Speak multi?', IS_MULTI);
  if (IS_MULTI) {
    stop();
    return multiTextDemo();
  }

  stop(); // Why?
  speak();
});

SpeakForm.addEventListener('reset', ev => {
  ev.preventDefault();

  stop();
  speak();
});

ResumeForm.addEventListener('submit', ev => {
  ev.preventDefault();
  console.warn('Pause/resume:', ev);

  playpause();
});

CancelForm.addEventListener('reset', ev => {
  ev.preventDefault();
  console.warn('Stop:', ev);

  stop();
});

// --------------------------------------------
// Reset button handlers.

PitchResetBtn.addEventListener('click', ev => {
  document.getElementById('pitch').value = 0.5;
});

RateResetBtn.addEventListener('click', ev => {
  document.getElementById('rate').value = 0;
});

VolumeResetBtn.addEventListener('click', ev => {
  document.getElementById('volume').value = 1;
});

VoiceResetBtn.addEventListener('click', ev => {
  document.getElementById('default-voice').selected = true;
});

/*
function resetPitch () { }
function resetRate () { }
function resetVolume () { }
function resetVoice () { }
*/
