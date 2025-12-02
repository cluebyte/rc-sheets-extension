const api = typeof browser !== "undefined" ? browser : chrome;

// Inject CSS for button styling
if (!document.querySelector('#rc-extension-styles')) {
  const style = document.createElement('style');
  style.id = 'rc-extension-styles';
  style.textContent = `
    .attribute-roll-btn,
    .use-with-attribute-btn,
    .cancel-roll-btn,
    .weapon-attack-btn,
    .weapon-damage-btn {
      margin-left: 8px !important;
      margin-right: 4px !important;
    }
  `;
  document.head.appendChild(style);
}

// State for attribute + skill roll flow
let selectedAttribute = null;
let selectedAttributeValue = null;
let cancelBtn = null;

function resetRollSelection() {
  selectedAttribute = null;
  selectedAttributeValue = null;
  
  // Remove all skill roll buttons
  document.querySelectorAll('.use-with-attribute-btn').forEach(btn => btn.remove());
  
  // Remove cancel button
  if (cancelBtn) {
    cancelBtn.remove();
    cancelBtn = null;
  }
  
  // Re-show attribute roll buttons
  document.querySelectorAll('.attribute-roll-btn').forEach(btn => {
    btn.style.display = 'inline-block';
  });
}

// Inject attribute roll buttons
const attributeElements = document.querySelectorAll('.attribute-name');
console.log('Found', attributeElements.length, 'attribute elements');

// Wait for page to load and try again
setTimeout(() => {
  const delayedAttributeElements = document.querySelectorAll('.attribute-name');
  
  if (delayedAttributeElements.length > 0) {
    setupAttributeButtons();
  }
}, 2000);

function setupAttributeButtons() {
  document.querySelectorAll('.attribute-name').forEach(nameEl => {
  const attrClass = Array.from(nameEl.classList).find(c => c.startsWith('attribute-name-') && c !== 'attribute-name');
  if (!attrClass) return;
  const attrKey = attrClass.replace('attribute-name-', '');

  const valueEl = document.querySelector(`.attribute-value.attribute-value-${CSS.escape(attrKey)}`);
  const attrValue = valueEl ? valueEl.textContent.trim() : null;

  const attrName = nameEl.textContent.trim();
  
  // Inject attribute roll button
  if (!nameEl.querySelector('.attribute-roll-btn')) {
    const btn = document.createElement('button');
    btn.textContent = 'Roll';
    btn.className = 'attribute-roll-btn mantine-Button-root mantine-Button-filled mantine-Button-sm';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAttribute = attrName;
      selectedAttributeValue = attrValue;
      
      // Hide all attribute roll buttons
      document.querySelectorAll('.attribute-roll-btn').forEach(btn => {
        btn.style.display = 'none';
      });
      
      // Add cancel button
      if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Roll';
        cancelBtn.className = 'cancel-roll-btn mantine-Button-root mantine-Button-subtle mantine-Button-sm';
        cancelBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000;';
        cancelBtn.addEventListener('click', resetRollSelection);
        document.body.appendChild(cancelBtn);
      }
      
      // Show skill roll buttons
      document.querySelectorAll('.skill-name').forEach(skillNameEl => {
        const skillClass = Array.from(skillNameEl.classList).find(c => c.startsWith('skill-name-') && c !== 'skill-name');
        if (!skillClass) return;
        const skillName = skillClass.replace('skill-name-', '');
        
        const skillValueEl = document.querySelector(`.skill-value.skill-value-${CSS.escape(skillName)}`);
        const skillValue = skillValueEl ? skillValueEl.textContent.trim() : null;
        
        if (skillValueEl && !skillNameEl.querySelector('.use-with-attribute-btn')) {
          const skillBtn = document.createElement('button');
          skillBtn.textContent = 'Roll';
          skillBtn.className = 'use-with-attribute-btn mantine-Button-root mantine-Button-subtle mantine-Button-sm';
          skillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Prompt for bonus dice
            const bonusInput = prompt(`Attribute Roll: ${attrName} (${attrValue}) + ${skillName} (${skillValue})\n\nEnter bonus dice (+ or - value):`);
            if (bonusInput === null) return; // User cancelled
            
            const bonusValue = parseInt(bonusInput, 10) || 0;
            
            (typeof browser !== "undefined" ? browser : chrome).runtime.sendMessage({
              type: 'roll-attribute-skill',
              attribute: attrName,
              attributeValue: attrValue,
              skill: skillName,
              skillValue: skillValue,
              bonus: bonusValue
            });
            resetRollSelection();
          });
          skillNameEl.appendChild(skillBtn);
        }
      });
    });
    nameEl.appendChild(btn);
  }
});
}

// Also run immediately in case elements are already loaded
setupAttributeButtons();

// Set up weapons with delay
setTimeout(() => {
  const weaponElements = document.querySelectorAll('.weapon-name');
  if (weaponElements.length > 0) {
    setupWeaponButtons();
  }
}, 2000);

function setupWeaponButtons() {
// For each weapon, find the name, attack skill, and damage.
document.querySelectorAll('.weapon-name').forEach(weaponNameEl => {
  // Find the class that starts with 'weapon-name-' (excluding 'weapon-name' itself)
  const weaponClass = Array.from(weaponNameEl.classList).find(c => c.startsWith('weapon-name-') && c !== 'weapon-name');
  if (!weaponClass) return;
  const weaponKey = weaponClass.replace('weapon-name-', '');

  // Find the corresponding attack skill and damage elements
  const attackSkillEl = document.querySelector(`.weapon-attack-skill.weapon-attack-skill-${CSS.escape(weaponKey)}`);
  const damageEl = document.querySelector(`.weapon-damage.weapon-damage-${CSS.escape(weaponKey)}`);

  const attackSkillText = attackSkillEl ? attackSkillEl.textContent.trim() : null;
  const damage = damageEl ? damageEl.textContent.trim() : null;

  if (!attackSkillText) return;

  // Parse attack skill text to extract attribute and skill names (not values)
  function parseAttackSkillText(attackText) {
    // Split by + to get attribute and skill parts
    const parts = attackText.split('+').map(p => p.trim());
    if (parts.length < 2) return null;

    const attributePart = parts[0]; // e.g., "DEX" or "STR OR DEX"
    const skillPart = parts[1]; // e.g., "Melee(L)" or "Athletics"

    return { attributePart, skillPart };
  }

  // Look up current attribute and skill values from the DOM or cache (called at click time)
  function getAttackValues(attributePart, skillPart) {
    // Handle OR in attributes - take the highest value
    let bestAttribute = null;
    let bestAttributeValue = 0;

    const attributeOptions = attributePart.split(/\s+OR\s+/i);
    attributeOptions.forEach(attr => {
      const attrName = attr.trim().toUpperCase();
      const attrValueEl = document.querySelector(`.attribute-value.attribute-value-${CSS.escape(attrName.toLowerCase())}`);
      const attrValue = attrValueEl ? parseInt(attrValueEl.textContent.trim(), 10) : 0;
      
      if (attrValue > bestAttributeValue) {
        bestAttribute = attrName;
        bestAttributeValue = attrValue;
      }
    });

    // Get skill value - try multiple approaches
    let skillValue = 0;
    let matchedSkillName = skillPart;
    
    // Approach 1: Try direct class-based lookup with different naming conventions
    // The class might be "melee-(l)" for skill "Melee(L)"
    const skillVariants = [
      skillPart.toLowerCase(),                                    // melee(l)
      skillPart.toLowerCase().replace('(', '-(').replace(')', ')'), // melee-(l) - actual format!
      skillPart.toLowerCase().replace('(', '-').replace(')', ''),  // melee-l
      skillPart.toLowerCase().replace(/[()]/g, ''),               // meleel
    ];
    
    for (const variant of skillVariants) {
      const skillValueEl = document.querySelector(`.skill-value.skill-value-${CSS.escape(variant)}`);
      if (skillValueEl) {
        skillValue = parseInt(skillValueEl.textContent.trim(), 10) || 0;
        console.log('Found skill value via DOM class:', variant, '=', skillValue);
        break;
      }
    }
    
    // Approach 2: Fallback - find skill by matching display text in DOM
    if (skillValue === 0) {
      document.querySelectorAll('.skill-name').forEach(skillEl => {
        // Get only text content, excluding child elements (like buttons)
        let skillDisplayText = '';
        skillEl.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            skillDisplayText += node.textContent;
          }
        });
        skillDisplayText = skillDisplayText.trim();
        
        if (skillDisplayText.toLowerCase() === skillPart.toLowerCase()) {
          const skillClass = Array.from(skillEl.classList).find(c => c.startsWith('skill-name-') && c !== 'skill-name');
          if (skillClass) {
            const skillKey = skillClass.replace('skill-name-', '');
            const skillValueEl = document.querySelector(`.skill-value.skill-value-${CSS.escape(skillKey)}`);
            if (skillValueEl) {
              skillValue = parseInt(skillValueEl.textContent.trim(), 10) || 0;
              matchedSkillName = skillDisplayText;
              console.log('Found skill value via DOM text match:', skillKey, '=', skillValue);
            }
          }
        }
      });
    }

    return {
      attribute: bestAttribute,
      attributeValue: bestAttributeValue,
      skill: matchedSkillName,
      skillValue: skillValue
    };
  }

  const parsedAttack = parseAttackSkillText(attackSkillText);
  
  // Inject attack roll button next to weapon name
  if (parsedAttack && !weaponNameEl.querySelector('.weapon-attack-btn')) {
    const btn = document.createElement('button');
    btn.textContent = 'Attack';
    btn.className = 'weapon-attack-btn mantine-Button-root mantine-Button-filled mantine-Button-sm';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Look up values NOW (at click time), not at setup time
      const attackData = getAttackValues(parsedAttack.attributePart, parsedAttack.skillPart);
      
      // Prompt for bonus dice
      const bonusInput = prompt(`Attack Roll: ${attackData.attribute} (${attackData.attributeValue}) + ${attackData.skill} (${attackData.skillValue})\n\nEnter bonus dice (+ or - value):`);
      if (bonusInput === null) return; // User cancelled
      
      const bonusValue = parseInt(bonusInput, 10) || 0;
      
      (typeof browser !== "undefined" ? browser : chrome).runtime.sendMessage({
        type: 'roll-weapon-attack',
        weapon: weaponNameEl.textContent.trim(),
        attribute: attackData.attribute,
        attributeValue: attackData.attributeValue,
        skill: attackData.skill,
        skillValue: attackData.skillValue,
        bonus: bonusValue
      });
    });
    weaponNameEl.appendChild(btn);
  }

  // Parse and add damage roll button
  if (damage && !damageEl.querySelector('.weapon-damage-btn')) {
    // Parse damage string (e.g., "3D+2", "2D+1(STR)", "4D")
    function parseDamage(damageText) {
      // Remove any attribute references in parentheses first
      const cleanDamage = damageText.replace(/\([^)]*\)/g, '').trim();
      
      // Match patterns like "3D+2", "2D-1", "4D"
      const match = cleanDamage.match(/(\d+)D([+-]\d+)?/i);
      if (!match) return null;

      const diceCount = parseInt(match[1], 10);
      const bonus = match[2] ? parseInt(match[2], 10) : 0;

      return { diceCount, bonus };
    }

    const damageData = parseDamage(damage);
    
    if (damageData) {
      const damageBtn = document.createElement('button');
      damageBtn.textContent = 'Damage';
      damageBtn.className = 'weapon-damage-btn mantine-Button-root mantine-Button-outline mantine-Button-sm';
      damageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Prompt for bonus damage dice
        const bonusInput = prompt(`Damage Roll: ${damageData.diceCount}D+${damageData.bonus}\n\nEnter bonus damage dice (+ or - value):`);
        if (bonusInput === null) return; // User cancelled
        
        const bonusValue = parseInt(bonusInput, 10) || 0;
        
        (typeof browser !== "undefined" ? browser : chrome).runtime.sendMessage({
          type: 'roll-weapon-damage',
          weapon: weaponNameEl.textContent.trim(),
          diceCount: damageData.diceCount,
          damageBonus: damageData.bonus,
          bonus: bonusValue
        });
      });
      damageEl.appendChild(damageBtn);
    }
  }
});
}

// Also run weapon setup immediately in case elements are already loaded
setupWeaponButtons();

// Track current URL for navigation detection
let currentUrl = window.location.href;

// MutationObserver to handle dynamic DOM changes
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    let shouldCheckAttributes = false;
    let shouldCheckWeapons = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if any attribute elements were added
          if (node.classList?.contains('attribute-name') || 
              node.querySelector?.('.attribute-name')) {
            shouldCheckAttributes = true;
          }

          // Check if any weapon elements were added
          if (node.classList?.contains('weapon-name') || 
              node.querySelector?.('.weapon-name')) {
            shouldCheckWeapons = true;
          }

          // Check if any skill elements were added (for the attribute roll flow)
          if (node.classList?.contains('skill-name') || 
              node.querySelector?.('.skill-name')) {
            if (selectedAttribute) {
              shouldCheckAttributes = true; // Re-run to add skill buttons
            }
          }
        }
      });
    });
    
    // Check for URL changes (SPA navigation detection)
    if (window.location.href !== currentUrl) {
      console.log('Navigation detected:', currentUrl, '->', window.location.href);
      currentUrl = window.location.href;
      // Reset attribute roll state on navigation
      resetRollSelection();
    }
    
    // Run setup functions for newly added elements
    if (shouldCheckAttributes) {
      setupAttributeButtons();
    }
    if (shouldCheckWeapons) {
      setupWeaponButtons();
    }
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('MutationObserver started - watching for DOM changes and navigation');
}

// Listen for browser back/forward navigation
window.addEventListener('popstate', () => {
  console.log('Browser navigation detected (popstate) - resetting roll state');
  resetRollSelection();
});

// Start the observer after initial setup
observeDOMChanges();