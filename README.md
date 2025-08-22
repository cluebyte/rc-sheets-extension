# RC Sheets to Roll20 Extension

A browser extension that allows you to click skills and weapons in your Repair Crew character sheet app and automatically trigger dice rolls in Roll20.

## Features

- **Attribute + Skill Rolls**: Select an attribute, then a skill, and roll them together with optional bonus dice
- **Weapon Attack Rolls**: Click attack buttons on weapons to automatically roll with the correct attribute and skill
- **Weapon Damage Rolls**: Click damage buttons to roll weapon damage with optional bonus dice
- **Cross-browser Support**: Works in both Chrome and Firefox
- **Seamless Integration**: Uses your app's existing Mantine styling for buttons

## Installation

### Chrome

1. **Download the Extension**

   - Download or clone this repository to your computer

2. **Enable Developer Mode**

   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**

   - Click "Load unpacked"
   - Select the folder containing the extension files (`manifest.json`, etc.)

4. **Verify Installation**
   - The extension should appear in your extensions list
   - Make sure it's enabled (toggle switch is on)

### Firefox

1. **Download the Extension**

   - Download or clone this repository to your computer

2. **Load for Testing**

   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Navigate to the extension folder and select `manifest.json`

3. **Verify Installation**
   - The extension should appear in the "Temporary Extensions" list
   - Note: Temporary extensions are removed when Firefox restarts

#### For Permanent Installation in Firefox

- You'll need to sign the extension through Mozilla's Add-on Developer Hub
- Or use Firefox Developer Edition for unsigned extensions

## Usage

### Prerequisites

- Have your character sheet open at: `https://repair-crew-sheets-1zhn.vercel.app/character/[your-character-id]`
- Have Roll20 open at: `https://app.roll20.net/editor/`

### Attribute + Skill Rolls

1. Click an "Attribute Roll" button next to any attribute (STR, DEX, etc.)
2. Click "Use with Attribute" next to the skill you want to use
3. Enter any bonus dice when prompted
4. The roll will appear in Roll20 chat

### Weapon Attacks

1. Find any weapon in your character sheet
2. Click the "Attack" button next to the weapon name
3. Enter any bonus dice when prompted
4. The attack roll will appear in Roll20 chat

### Weapon Damage

1. Find any weapon in your character sheet
2. Click the "Damage" button next to the weapon damage
3. Enter any bonus damage dice when prompted
4. The damage roll will appear in Roll20 chat

### Cancel Operations

- When in attribute selection mode, click the red "Cancel Roll" button in the top-right to abort

## Troubleshooting

### Extension Not Working

- Make sure both the character sheet and Roll20 are open in tabs
- Check that the URLs match the expected patterns
- Reload the extension and refresh both pages

### Buttons Not Appearing

- Refresh the character sheet page
- Check browser console for errors (F12)
- Ensure the extension has permission to access the site

### Rolls Not Appearing in Roll20

- Make sure you're on the Roll20 editor page (`/editor/`)
- Check that the chat input and send button are visible
- Verify the extension has permission to access Roll20

### Debugging

- Open browser developer tools (F12)
- Check the Console tab for error messages
- Background script console can be accessed via the extension management page

## File Structure

```
rc-sheets-extension/
├── manifest.json          # Extension configuration
├── background.js          # Message routing between tabs
├── content-sheet.js       # Character sheet integration
├── content-roll20.js      # Roll20 integration
└── README.md             # This file
```

## Permissions

The extension requires the following permissions:

- `tabs`: To find and communicate between character sheet and Roll20 tabs
- `scripting`: To inject content scripts
- Access to `https://repair-crew-sheets-1zhn.vercel.app/*`: Character sheet integration
- Access to `https://app.roll20.net/*`: Roll20 integration

## Support

If you encounter issues:

1. Check this README's troubleshooting section
2. Verify all prerequisites are met
3. Check browser console for error messages
4. Ensure the extension has proper permissions

## Version History

- **1.0**: Initial release with attribute+skill rolls, weapon attacks, and weapon damage
