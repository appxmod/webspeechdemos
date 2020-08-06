/**
 * Switch between server-based synthesis, and Web Speech API synthesis!
 *
 * @copyright © Nick Freear, 05-August-2020.
 */

import { updateStatus, param } from './util.js';

const { speechSynthesis, SpeechSynthesisUtterance } = window;
const fetch = window.fetch;

// https://uksouth.tts.speech.microsoft.com/cognitiveservices/voices/list
// https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1
const TTS_URL = 'https://uksouth.tts.speech.microsoft.com/cognitiveservices';
const KEY_REGEX = /key=(\w+)/;

export function useWebApi () {
  return !param(KEY_REGEX);
}

export class BespokeSynthesis {
  // Was: 'export class CustomSynthesis { .. }'

  constructor () {
    this.paused = true;

    console.warn('Use Web Speech API?', useWebApi());
    updateStatus(useWebApi() ? 'web-api-yes' : 'web-api-no', 'Loading ...');

    this.key = param(KEY_REGEX);

    this.$audioElem = document.querySelector('audio');
  }

  async getVoices () {
    if (useWebApi()) {
      updateStatus('success', 'OK. Voices loaded (Web Speech API).');

      return speechSynthesis.getVoices();
    } else {
      try {
        const response = await fetch(`${TTS_URL}/voices/list`, {
          headers: {
            Accept: 'application/json',
            'Ocp-Apim-Subscription-Key': this.key
          }
        });
        const voiceList = await response.json();

        console.warn('Fetch voices:', response, voiceList.length);
        updateStatus('success', 'OK. Voices loaded from server.');

        return voiceList;
      } catch (err) {
        console.error('>> ERROR.', err);
        updateStatus('error', 'Sorry! Can\'t load voices. <em>(Is the <q>key</q> correct?)</em>');
      }
    }
  }

  async speak (utterThis) {
    if (useWebApi()) {
      return speechSynthesis.speak(utterThis);
    } else {
      try {
        const AUDIO = this.$audioElem;
        const response = await fetch(`${TTS_URL}/v1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ssml+xml',
            'Ocp-Apim-Subscription-Key': this.key,
            'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3'
          },
          body: this.utterToSsml(utterThis)
        });
        const mimeType = await response.headers.get('content-type');

        console.warn('Fetch speech:', response, mimeType);

        // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#
        const blob = await response.blob();
        const url = await URL.createObjectURL(blob);

        console.warn('Fetch speech (2):', url);

        AUDIO.src = url;
        AUDIO.onloadedmetadata = function (ev) {
          AUDIO.play();
          AUDIO.muted = false;
        };

        this.paused = false;

        /* AUDIO.srcObject = await response.body.getReader();
        */
      } catch (err) { console.error('>> ERROR.', err); }
    }
  }

  cancel () {
    useWebApi() ? speechSynthesis.cancel() : this.$audioElem.pause();
  }

  pause () {
    useWebApi() ? speechSynthesis.pause() : this.$audioElem.pause();
    this.paused = true;
  }

  resume () {
    useWebApi() ? speechSynthesis.resume() : this.$audioElem.play();
    this.paused = false;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
  utterToSsml (UTTER) {
    const voxName = UTTER.voice.name || UTTER.voice.Name;
    const SSML = `<speak version="1.0" xml:lang="en-US">
    <voice xml:lang="en-US" name="${voxName}">
      <prosody pitch="+0%" rate="+0%" volume="+0%">
        ${UTTER.text}
      </prosody>
    </voice>
    </speak>`;

    console.warn('Utterance:', UTTER, SSML);

    return SSML;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
export class BespokeSynthUtterance {
  constructor (text) {
    if (useWebApi()) {
      return new SpeechSynthesisUtterance(text);
    } else {
      return {
        text,
        lang: 'en',
        voice: null,
        addEventListener: () => {}
      };
    }
  }
}
