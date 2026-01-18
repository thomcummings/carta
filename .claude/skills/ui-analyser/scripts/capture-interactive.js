#!/usr/bin/env node
/**
 * Interactive UI Capture Script
 * Captures component states (hover, focus, expanded) for detailed UI analysis.
 * 
 * Usage:
 *   node capture-interactive.js <url> [output-dir]
 * 
 * This script captures:
 *   - Default viewport states
 *   - Hover states on interactive elements (buttons, links, cards)
 *   - Focus states on form elements
 *   - Open states on dropdowns/menus (attempted)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const INTERACTIVE_SELECTORS = {
  buttons: 'button, [role="button"], .btn, [class*="button"]',
  links: 'a[href], [role="link"]',
  cards: '[class*="card"], [role="article"], .card',
  inputs: 'input, textarea, select',
  dropdowns: '[class*="dropdown"], [class*="menu"], [role="menu"]',
  navItems: 'nav a, nav button, [role="navigation"] a',
};

async function captureInteractive(url, outputDir = './ui-captures') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const statesDir = path.join(outputDir, 'states');
  if (!fs.existsSync(statesDir)) {
    fs.mkdirSync(statesDir, { recursive: true });
  }

  console.log(`Capturing interactive states from: ${url}`);
  console.log(`Output directory: ${outputDir}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const capturedStates = [];

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Capture base state
    const basePath = path.join(outputDir, 'base-state.png');
    await page.screenshot({ path: basePath });
    console.log('✓ Captured base state');
    capturedStates.push({ name: 'base-state', file: 'base-state.png', type: 'base' });

    // Capture button hover states
    console.log('\nCapturing button hover states...');
    const buttons = await page.$$(INTERACTIVE_SELECTORS.buttons);
    const visibleButtons = [];
    
    for (const btn of buttons.slice(0, 10)) { // Limit to first 10
      const isVisible = await btn.isVisible();
      const box = await btn.boundingBox();
      if (isVisible && box && box.width > 20 && box.height > 20) {
        visibleButtons.push({ element: btn, box });
      }
    }

    for (let i = 0; i < Math.min(visibleButtons.length, 5); i++) {
      const { element, box } = visibleButtons[i];
      try {
        await element.hover();
        await page.waitForTimeout(300);
        
        const filename = `button-hover-${i + 1}.png`;
        const filepath = path.join(statesDir, filename);
        
        // Capture area around the button with padding
        const padding = 40;
        await page.screenshot({
          path: filepath,
          clip: {
            x: Math.max(0, box.x - padding),
            y: Math.max(0, box.y - padding),
            width: box.width + padding * 2,
            height: box.height + padding * 2,
          }
        });
        
        console.log(`  ✓ Button ${i + 1} hover state`);
        capturedStates.push({ 
          name: `button-hover-${i + 1}`, 
          file: `states/${filename}`, 
          type: 'hover',
          component: 'button'
        });

        // Move mouse away to reset
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
      } catch (e) {
        // Skip elements that can't be hovered
      }
    }

    // Capture card hover states
    console.log('\nCapturing card hover states...');
    const cards = await page.$$(INTERACTIVE_SELECTORS.cards);
    
    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      const card = cards[i];
      const isVisible = await card.isVisible();
      const box = await card.boundingBox();
      
      if (isVisible && box && box.width > 100 && box.height > 50) {
        try {
          await card.hover();
          await page.waitForTimeout(300);
          
          const filename = `card-hover-${i + 1}.png`;
          const filepath = path.join(statesDir, filename);
          
          await page.screenshot({
            path: filepath,
            clip: {
              x: Math.max(0, box.x - 10),
              y: Math.max(0, box.y - 10),
              width: Math.min(box.width + 20, 800),
              height: Math.min(box.height + 20, 600),
            }
          });
          
          console.log(`  ✓ Card ${i + 1} hover state`);
          capturedStates.push({ 
            name: `card-hover-${i + 1}`, 
            file: `states/${filename}`, 
            type: 'hover',
            component: 'card'
          });

          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        } catch (e) {
          // Skip
        }
      }
    }

    // Capture input focus states
    console.log('\nCapturing input focus states...');
    const inputs = await page.$$(INTERACTIVE_SELECTORS.inputs);
    
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      const input = inputs[i];
      const isVisible = await input.isVisible();
      const box = await input.boundingBox();
      
      if (isVisible && box && box.width > 50) {
        try {
          await input.focus();
          await page.waitForTimeout(300);
          
          const filename = `input-focus-${i + 1}.png`;
          const filepath = path.join(statesDir, filename);
          
          const padding = 20;
          await page.screenshot({
            path: filepath,
            clip: {
              x: Math.max(0, box.x - padding),
              y: Math.max(0, box.y - padding),
              width: box.width + padding * 2,
              height: box.height + padding * 2,
            }
          });
          
          console.log(`  ✓ Input ${i + 1} focus state`);
          capturedStates.push({ 
            name: `input-focus-${i + 1}`, 
            file: `states/${filename}`, 
            type: 'focus',
            component: 'input'
          });

          await input.blur();
          await page.waitForTimeout(200);
        } catch (e) {
          // Skip
        }
      }
    }

    // Try to capture a dropdown/menu open state
    console.log('\nLooking for dropdown menus...');
    const dropdownTriggers = await page.$$('[class*="dropdown"] button, [aria-haspopup="true"], [data-dropdown]');
    
    if (dropdownTriggers.length > 0) {
      const trigger = dropdownTriggers[0];
      const isVisible = await trigger.isVisible();
      
      if (isVisible) {
        try {
          await trigger.click();
          await page.waitForTimeout(500);
          
          const filename = 'dropdown-open.png';
          const filepath = path.join(statesDir, filename);
          await page.screenshot({ path: filepath });
          
          console.log('  ✓ Dropdown open state');
          capturedStates.push({ 
            name: 'dropdown-open', 
            file: `states/${filename}`, 
            type: 'open',
            component: 'dropdown'
          });

          // Close by clicking elsewhere
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(300);
        } catch (e) {
          // Skip
        }
      }
    }

    // Save manifest
    const manifest = {
      url,
      capturedAt: new Date().toISOString(),
      type: 'interactive-capture',
      states: capturedStates
    };
    
    const manifestPath = path.join(outputDir, 'interactive-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Interactive capture complete!`);
    console.log(`   ${capturedStates.length} states captured`);
    console.log(`   Manifest: interactive-manifest.json`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// CLI
const url = process.argv[2];
const outputDir = process.argv[3] || './ui-captures';

if (!url) {
  console.error('Usage: node capture-interactive.js <url> [output-dir]');
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

captureInteractive(url, outputDir);
