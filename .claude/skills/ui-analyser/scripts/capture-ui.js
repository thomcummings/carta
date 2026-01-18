#!/usr/bin/env node
/**
 * UI Capture Script
 * Captures screenshots of a URL at multiple viewports for UI analysis.
 * 
 * Usage:
 *   node capture-ui.js <url> [output-dir]
 * 
 * Examples:
 *   node capture-ui.js https://example.com
 *   node capture-ui.js https://example.com ./screenshots
 * 
 * Outputs:
 *   - desktop-1440.png  (1440x900 viewport)
 *   - desktop-1280.png  (1280x800 viewport)
 *   - tablet-768.png    (768x1024 viewport)
 *   - mobile-375.png    (375x667 viewport)
 *   - full-page.png     (full scrollable page at 1440px)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 667 },
];

async function captureUI(url, outputDir = './ui-captures') {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Capturing UI from: ${url}`);
  console.log(`Output directory: ${outputDir}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and wait for network idle
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit more for any animations to settle
    await page.waitForTimeout(1000);

    // Capture at each viewport
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300); // Let layout settle
      
      const filename = path.join(outputDir, `${viewport.name}.png`);
      await page.screenshot({ path: filename });
      console.log(`✓ Captured ${viewport.name} (${viewport.width}x${viewport.height})`);
    }

    // Capture full page at desktop width
    await page.setViewportSize({ width: 1440, height: 900 });
    const fullPagePath = path.join(outputDir, 'full-page.png');
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`✓ Captured full-page scroll`);

    // Try to capture dark mode if toggle exists
    const darkModeToggle = await page.$('[data-theme-toggle], [aria-label*="dark"], [aria-label*="theme"], .theme-toggle, #theme-toggle');
    if (darkModeToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      const darkPath = path.join(outputDir, 'desktop-1440-dark.png');
      await page.screenshot({ path: darkPath });
      console.log(`✓ Captured dark mode variant`);
    }

    console.log(`\n✅ Capture complete! ${VIEWPORTS.length + 1} screenshots saved.`);
    
    // Output summary for easy reference
    const manifest = {
      url,
      capturedAt: new Date().toISOString(),
      screenshots: [
        ...VIEWPORTS.map(v => ({ name: v.name, file: `${v.name}.png`, width: v.width, height: v.height })),
        { name: 'full-page', file: 'full-page.png', width: 1440, fullPage: true }
      ]
    };
    
    const manifestPath = path.join(outputDir, 'capture-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Manifest saved to capture-manifest.json`);

  } catch (error) {
    console.error(`Error capturing UI: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// CLI entry point
const url = process.argv[2];
const outputDir = process.argv[3] || './ui-captures';

if (!url) {
  console.error('Usage: node capture-ui.js <url> [output-dir]');
  console.error('Example: node capture-ui.js https://dribbble.com/shots/12345');
  process.exit(1);
}

// Validate URL
try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

captureUI(url, outputDir);
