
import { stop, playpause, speak } from './index.js';

const SpeakForm = document.querySelector('#speak-form');
const ResumeForm = document.querySelector('#resume-form');
const CancelForm = document.querySelector('#cancel-form');

const PitchResetBtn = document.querySelector('.pitch-field button');
const RateResetBtn = document.querySelector('.rate-field button');
const VolumeResetBtn = document.querySelector('.volume-field button');
const VoiceResetBtn = document.querySelector('.voice-field button');

SpeakForm.addEventListener('submit', ev => {
  ev.preventDefault();

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
