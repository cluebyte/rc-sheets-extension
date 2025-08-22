// Use browser.* for Firefox, chrome.* for Chrome, or use a wrapper for both
const api = typeof browser !== "undefined" ? browser : chrome;

async function sendToRoll20(msg) {
  try {
    const tabs = await api.tabs.query({ url: "https://app.roll20.net/*" });
    if (tabs.length > 0) {
      await api.tabs.sendMessage(tabs[0].id, msg);
    }
  } catch (error) {
    console.error('Background: Error sending message:', error);
  }
}

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const allowedTypes = ['roll-skill', 'roll-attribute-skill', 'roll-weapon-attack', 'roll-weapon-damage'];
  if (allowedTypes.includes(msg.type)) {
    sendToRoll20(msg);
  }
});