import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 10000 });
    
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('Login Body snippet:', textContent.substring(0, 100));

    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    const dashContent = await page.evaluate(() => document.body.innerText);
    console.log('Dashboard Body snippet:', dashContent.substring(0, 100));

  } catch (err) {
    console.log('Failed to load page:', err.message);
  }

  await browser.close();
})();
