import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  const videoPath = path.resolve('..', 'PathWise_Demo_Walkthrough.webm');
  const fileUrl = 'file:///' + videoPath.replace(/\\/g, '/');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;">
        <video id="v" src="${fileUrl}" style="width:1280px;height:720px;" muted playsinline></video>
      </body>
    </html>
  `);

  await page.waitForFunction(() => {
    const v = document.getElementById('v');
    return v && v.readyState >= 2;
  });

  const timestamps = [36, 45, 54, 65, 75];
  for (const t of timestamps) {
    await page.evaluate((seekTime) => {
      const vid = document.getElementById('v');
      vid.pause();
      vid.currentTime = seekTime;
    }, t);
    
    await page.waitForTimeout(600);
    const outPath = path.resolve('demo_recordings', `frame_${t}s.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved frame_${t}s.png`);
  }

  await browser.close();
  console.log('Frame extraction complete!');
})();
