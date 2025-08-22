// Use browser.* for Firefox, chrome.* for Chrome, or use a wrapper for both
const api = typeof browser !== "undefined" ? browser : chrome;

function sendToRoll20(msg) {
  api.tabs.query({ url: "https://app.roll20.net/editor/*" }, (tabs) => {
    if (tabs.length > 0) {
      api.tabs.sendMessage(tabs[0].id, msg);
    }
  });
}

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const allowedTypes = ['roll-skill', 'roll-attribute-skill', 'roll-weapon-attack', 'roll-weapon-damage'];
  if (allowedTypes.includes(msg.type)) {
    sendToRoll20(msg);
  }
});