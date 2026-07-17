import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    } else {
      console.log(`PAGE LOG: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`PAGE EXCEPTION: ${err.message}`);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Page loaded successfully.');
  } catch (err) {
    console.log('Failed to load page:', err.message);
  }

  await browser.close();
})();
