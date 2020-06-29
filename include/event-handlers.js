
import { stop, playpause, speak } from './index.js';

const SpeakForm = document.querySelector('#speak-form');
const ResumeForm = document.querySelector('#resume-form');
const CancelForm = document.querySelector('#cancel-form');

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
