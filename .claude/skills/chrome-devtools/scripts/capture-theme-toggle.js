import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureThemeScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for everything to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture light mode
    await page.screenshot({
      path: '/Users/kien.ha/Code/profile/docs/screenshots/theme-light-mode.png',
      fullPage: true
    });

    console.log('✓ Light mode screenshot captured');

    // Click the theme toggle button
    await page.click('button[aria-label="Toggle theme"]');

    // Wait for theme transition
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture dark mode
    await page.screenshot({
      path: '/Users/kien.ha/Code/profile/docs/screenshots/theme-dark-mode.png',
      fullPage: true
    });

    console.log('✓ Dark mode screenshot captured');

    console.log(JSON.stringify({
      success: true,
      lightMode: '/Users/kien.ha/Code/profile/docs/screenshots/theme-light-mode.png',
      darkMode: '/Users/kien.ha/Code/profile/docs/screenshots/theme-dark-mode.png'
    }, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureThemeScreenshots();
