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

export { param, updateStatus, updateLog, logBrowser, plainObject, jsonPrettyish };
