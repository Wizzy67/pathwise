import { chromium } from 'playwright';

const ROUTES = [
  '/', '/choice', '/register', '/login', '/welcome', 
  '/secure-admin-access', '/admin', '/quiz', '/results',
  '/dashboard', '/explore', '/career/1', '/saved', '/activity',
  '/profile', '/advisor', '/study-plan', '/report'
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  for (const route of ROUTES) {
    try {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      const rootChildren = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.children.length : -1;
      });
      console.log(`Route ${route}: Root children count = ${rootChildren}`);
    } catch (err) {
      console.log(`Route ${route}: Failed - ${err.message}`);
    }
  }

  await browser.close();
})();
