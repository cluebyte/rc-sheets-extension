const api = typeof browser !== "undefined" ? browser : chrome;

function sendMessageToChat(msg) {
  const chatInput = document.querySelector('textarea[title="Text Chat Input"]');
  if (chatInput) {
    chatInput.value = msg;
    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Use the chat send button by id
    const sendBtn = document.querySelector('#chatSendBtn');
    if (sendBtn) {
      sendBtn.click();
    } else {
      console.warn('Roll20: Send button (#chatSendBtn) not found');
    }
  } else {
    console.warn('Roll20: Chat input not found');
  }
}

function sendMessageToChat(msg) {
  const chatInput = document.querySelector('textarea[title="Text Chat Input"]');
  if (chatInput) {
    chatInput.value = msg;
    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Use the chat send button by id
    const sendBtn = document.querySelector('#chatSendBtn');
    if (sendBtn) {
      sendBtn.click();
    } else {
      console.warn('Send button (#chatSendBtn) not found');
    }
  } else {
    console.warn('Chat input not found');
  }
}

api.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'roll-attribute-skill') {
    sendMessageToChat(`&{template:default} {{name= **ATTRIBUTE ROLL**}} {{Result: = [[${msg.attributeValue}d6+${msg.skillValue}+${msg.bonus}d6]]}} {{Destiny: = [[1t[Ability-Destiny]]]}}`);
  } else if (msg.type === 'roll-weapon-attack') {
    sendMessageToChat(`&{template:default} {{name= **ATTACK ROLL**}} {{Result: = [[${msg.attributeValue}d6+${msg.skillValue}+${msg.bonus}d6]]}} {{Destiny: = [[1t[Attack-Destiny]]]}}`);
  } else if (msg.type === 'roll-weapon-damage') {
    sendMessageToChat(`&{template:default} {{name= **DAMAGE ROLL**}} {{Result: = [[${msg.diceCount}d6+${msg.damageBonus}+${msg.bonus}d6]]}} {{Destiny: = [[1t[Damage-Destiny]]]}}`);
  } else {
    console.warn('Roll20: Unknown message type:', msg.type);
  }
});