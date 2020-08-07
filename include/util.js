/**
 * Utility functions.
 *
 * @copyright © Nick Freear, 29-June-2020.
 */

function updateStatus (className, messageHtml) {
  document.body.classList.add(className);
  document.querySelector('#status').innerHTML = messageHtml; // Was: this.$statusElem.innerHTML;
}

function updateLog (messageText) {
  document.querySelector('#log').textContent += `${messageText}\n`;
}

function param (regex, def = null) {
  const matches = window.location.search.match(regex);
  return matches ? matches[1] : def;
}

function logBrowser () {
  const NAV = window.navigator;

  console.warn('User agent :~', NAV.userAgent);
  console.warn(NAV);

  updateLog(`User agent :~ "${NAV.userAgent}"\n`);
}

// Include non-inumerable / inherited properties?
// https://medium.com/javascript-in-plain-english/5-easy-ways-to-iterate-over-javascript-object-properties-913d048e827f#
function plainObject (obj) {
  const result = {};
  /* Object.keys(obj).forEach(key => result[ key ] = obj[ key ]); */
  for (const key in obj) { result[key] = obj[key]; }
  return result;
}

function jsonPrettyish (data) {
  return JSON.stringify(data, null, 2).replace(/([^}],)\s+("\w+")/g, '$1 $2').replace(/\{\s+"/g, '{ "');
}

function setTextInput (lang = 'en') {
  // const QUOTE = '’';
  const TEXTS = {
    en: 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    fr: 'Appelez-moi Ishmael. Il y a quelques années - peu importe combien de temps précisément - ayant peu ou pas d’argent dans mon sac à main, et rien de particulier pour m’intéresser à terre, je pensais que je naviguerais un peu et voir la partie aquatique du monde.',
    zh_url: 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text=Call%20me%20%22Ishmael%22.%20Some%20years%20ago%E2%80%94never%20mind%20how%20long%20precisely%E2%80%94',
    zh_Pinyin: 'Jiào wǒ “yǐ shí mǎ lì”. Jǐ nián qián-méiguānxì jīngquè dào duō cháng shíjiān-wǒ de qiánbāo lǐ jīhū méiyǒu qián, méiyǒu shé me tèbié ràng wǒ gǎn xìngqù de zài ànshàng, wǒ xiǎng wǒ huì shāowéi hángxíng yīxià, kàn kàn shìjiè de shuǐyù.',
    zh: '叫我“以实玛利”。 几年前-没关系精确到多长时间-我的钱包里几乎没有钱，没有什么特别让我感兴趣的在岸上，我想我会稍微航行一下，看看世界的水域。'
  };
  return TEXTS[lang];
}

export { param, updateStatus, updateLog, logBrowser, plainObject, jsonPrettyish, setTextInput };
