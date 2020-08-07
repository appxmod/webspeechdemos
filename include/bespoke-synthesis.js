/**
 * Switch between server-based synthesis, and Web Speech API synthesis!
 *
 * @copyright © Nick Freear, 05-August-2020.
 */

import { updateStatus, param } from './util.js';

const { speechSynthesis, SpeechSynthesisUtterance, Request, fetch } = window;
const DEFAULT_REGION = 'uksouth';
const API_KEY_REGEX = /key=(\w+)/;

export function useWebApi () {
  return !param(API_KEY_REGEX);
}

export class BespokeSynthesis {
  // Was: 'export class CustomSynthesis { .. }'

  constructor (region = DEFAULT_REGION) {
    this.paused = true;
    this.region = region;
    this.key = param(API_KEY_REGEX);

    console.warn('Use Web Speech API?', useWebApi());
    updateStatus(useWebApi() ? 'web-api-yes' : 'web-api-no', 'Loading …');

    this.$audioElem = document.createElement('audio'); // Was: document.querySelector('audio');
  }

  // https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1
  ttsUrl (path = '') {
    return `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/${path}`;
  }

  getApiHeader () {
    return { 'Ocp-Apim-Subscription-Key': this.key };
  }

  async getVoices () {
    if (useWebApi()) {
      updateStatus('success', 'OK. Voices loaded (Web Speech API).');

      return speechSynthesis.getVoices();
    } else {
      try {
        const response = await fetch(this.ttsUrl('voices/list'), {
          headers: {
            Accept: 'application/json',
            ...this.getApiHeader()
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
        const request = new Request(this.ttsUrl('v1'), {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
            ...this.getApiHeader()
          },
          body: this.utterToSsml(utterThis)
        });
        const response = await fetch(request);
        const mimeType = await response.headers.get('content-type');
        const key = request.headers.get('Ocp-Apim-Subscription-Key');

        console.warn('Fetch speech:', response, request, key, mimeType);

        // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#
        const blob = await response.blob();
        const objectUrl = await URL.createObjectURL(blob);

        console.warn('Fetch speech (2):', objectUrl);

        AUDIO.src = objectUrl;
        AUDIO.onloadedmetadata = (ev) => {
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

  // https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup?tabs=javascript#adjust-prosody
  utterToSsml (UTTER) {
    const VOX = UTTER.voice;
    // Was: `rate="+0%"`
    const SSML = `<speak version="1.0" xml:lang="${VOX.lang || VOX.Locale}">
    <voice xml:lang="${VOX.lang || VOX.Locale}" name="${VOX.name || VOX.Name}">
      <prosody pitch="+0%" rate="${parseFloat(UTTER.rate)}" volume="+0%">
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
        lang: 'en', // ??
        rate: 1.0,
        voice: null,
        addEventListener: () => {}
      };
    }
  }
}
