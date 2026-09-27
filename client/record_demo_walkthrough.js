import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import jwt from '../server/node_modules/jsonwebtoken/index.js';

const JWT_SECRET = 'pathwise-super-secret-key-123!';

const demoUser = {
  id: 'accba9ed-6341-466d-a4a8-2e0f5f7aedf2',
  fullName: 'Wisdom Ifeanyi',
  matricNo: 'FOS/20/21/248900',
  faculty: 'Faculty of Science',
  department: 'Computer Science',
  level: '400',
  cgpa: 4.38,
  savedCareers: ['c_se', 'c_ds', 'c_cyber'],
  role: 'student',
  hollandCode: 'IRC',
  hollandLabel: 'Investigative · Realistic · Conventional',
  quizResults: [
    { careerId: 'c_se', id: 'c_se', score: 96 },
    { careerId: 'c_ds', id: 'c_ds', score: 92 },
    { careerId: 'c_cyber', id: 'c_cyber', score: 88 }
  ],
  riasecScores: { R: 78, I: 94, A: 50, S: 58, E: 68, C: 84 },
  lastQuizDate: new Date().toISOString()
};

const token = jwt.sign(
  { id: demoUser.id, role: 'student', matricNo: demoUser.matricNo },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const RECORDINGS_DIR = path.resolve('demo_recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setBanner(page, stepLabel, title, subtitle) {
  await page.evaluate(({ stepLabel, title, subtitle }) => {
    let banner = document.getElementById('demo-showcase-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-showcase-banner';
      banner.style.position = 'fixed';
      banner.style.bottom = '24px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '999999';
      banner.style.background = 'rgba(15, 23, 42, 0.92)';
      banner.style.backdropFilter = 'blur(12px)';
      banner.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      banner.style.borderRadius = '16px';
      banner.style.padding = '12px 24px';
      banner.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.35)';
      banner.style.color = '#ffffff';
      banner.style.fontFamily = "'Nunito', 'Segoe UI', sans-serif";
      banner.style.display = 'flex';
      banner.style.alignItems = 'center';
      banner.style.gap = '16px';
      banner.style.pointerEvents = 'none';
      banner.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      banner.style.maxWidth = '90%';
      document.body.appendChild(banner);
    }
    banner.innerHTML = `
      <div style="background: #20428B; color: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 999px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.25);">
        ${stepLabel}
      </div>
      <div>
        <div style="font-size: 14px; font-weight: 800; line-height: 1.2; color: #ffffff;">${title}</div>
        <div style="font-size: 12px; color: #94A3B8; font-weight: 500; margin-top: 2px;">${subtitle}</div>
      </div>
    `;
  }, { stepLabel, title, subtitle });
}

async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();
    await new Promise((resolve) => {
      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
}

(async () => {
  console.log('Starting Playwright Video Recording...');
  const browser = await chromium.launch({ headless: true });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Seed authentication in localStorage
  await page.goto('http://localhost:5000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, demoUser }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userProfile', JSON.stringify(demoUser));
  }, { token, demoUser });

  // ─────────────────────────────────────────────────────────────
  // SCENE 1: LANDING PAGE & HERO SHOWCASE
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 1: Landing Page');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 1 of 6', 'PathWise · Career Decision Support System', 'Calibrated directly for Delta State University (DELSU) students');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene1_landing.png') });
  await sleep(1000);

  // Smooth scroll down to 3D Showcase Frame
  await smoothScroll(page, 550, 1500);
  await setBanner(page, 'Feature Showcase', 'Real-Time Vocational Decision Engine', 'Connecting academic performance, RIASEC personality, and career goals');
  await sleep(2500);

  // Smooth scroll to Theoretical Foundation (RIASEC + SCCT + Constructivism)
  await smoothScroll(page, 1150, 1500);
  await setBanner(page, 'Theoretical Rigor', '3-Theory Scientific Architecture', 'Holland Codes (1959), Social Cognitive Career Theory (1994) & Constructivism');
  await sleep(2500);

  // Smooth scroll back to top
  await smoothScroll(page, 0, 1200);
  await sleep(1000);

  // ─────────────────────────────────────────────────────────────
  // SCENE 2: INTERACTIVE TOUR GUIDE STUDIO (/welcome)
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 2: Tour Guide Studio');
  await page.goto('http://localhost:5000/welcome', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 2 of 6', 'Interactive Desktop Tour Studio', 'Step 0: Personalized DELSU Student Credential Dossier');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene2_welcome.png') });
  await sleep(1500);

  // Step 1: Holland RIASEC & Likert Questions
  await page.keyboard.press('ArrowRight');
  await sleep(400);
  await setBanner(page, 'Tour Studio · Step 1', 'Holland RIASEC Profile & Assessment Preview', 'Multi-theory decision engine with live 6-dimension scoring bars');
  await sleep(2500);

  // Step 2: Nigerian Careers & Salary Benchmarks
  await page.keyboard.press('ArrowRight');
  await sleep(400);
  await setBanner(page, 'Tour Studio · Step 2', 'Curated Nigerian Career Profiles & Salaries', 'Real-world benchmarks (₦4.5M – ₦8.5M/yr) & aligned DELSU course electives');
  await sleep(2500);

  // Step 3: Bilingual AI Career Advisor Console
  await page.keyboard.press('ArrowRight');
  await sleep(400);
  await setBanner(page, 'Tour Studio · Step 3', '24/7 AI Advisor Console (English & Pidgin)', 'Context-aware guidance for SIWES placements, projects & CGPA targets');
  await sleep(2500);

  // Step 4: Unified Dashboard Ecosystem Preview
  await page.keyboard.press('ArrowRight');
  await sleep(400);
  await setBanner(page, 'Tour Studio · Step 4', 'All-in-One Student Ecosystem', 'Seamlessly synchronized between high-res desktop & mobile PWA');
  await sleep(2500);

  // ─────────────────────────────────────────────────────────────
  // SCENE 3: VOCATIONAL ASSESSMENT (/quiz)
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 3: Vocational Assessment');
  await page.goto('http://localhost:5000/quiz', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 3 of 6', 'Holland Code & SCCT Assessment', '18 calibrated Likert statements assessing vocational inclinations');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene3_quiz.png') });
  await sleep(1500);

  // Smooth scroll through assessment statements
  await smoothScroll(page, 400, 1200);
  await sleep(2000);

  // ─────────────────────────────────────────────────────────────
  // SCENE 4: CAREER MATCHING RESULTS (/results)
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 4: Assessment Results');
  await page.goto('http://localhost:5000/results', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 4 of 6', 'Calculated Results & Personality Analytics', 'Derived Holland Code: IRC (96% Match for Software Engineer)');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene4_results.png') });
  await sleep(1500);

  // Smooth scroll down to matched careers & RIASEC radar/distribution
  await smoothScroll(page, 500, 1500);
  await setBanner(page, 'Compatibility Rationale', 'Ranked Career Matches & Salary Trajectories', 'Empirical alignment with Nigerian tech industry demand');
  await sleep(2500);

  // ─────────────────────────────────────────────────────────────
  // SCENE 5: CAREER EXPLORER & CAREER DETAIL (/explore & /career/c_se)
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 5: Career Explorer');
  await page.goto('http://localhost:5000/explore', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 5 of 6 · Career Explorer', 'Curated Nigerian & Global Tech Opportunities', 'Browse 50+ career profiles, demand ratings, and salary trajectories');
  await sleep(2000);

  // Smooth scroll through career grid
  await smoothScroll(page, 450, 1500);
  await sleep(1200);

  // Open full Career Detail Dossier
  console.log('Opening Career Detail Dossier...');
  await page.goto('http://localhost:5000/career/c_se', { waitUntil: 'networkidle' });
  await setBanner(page, 'Career Dossier · Software Engineer', 'Comprehensive Vocational Intelligence', 'Nigerian Salary: ₦2M – ₦15M/yr · Professional Bodies: CPN & NCS');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene5_career.png') });
  await sleep(1500);
  await smoothScroll(page, 400, 1200);
  await sleep(2000);

  // ─────────────────────────────────────────────────────────────
  // SCENE 6: BILINGUAL AI ADVISOR & DASHBOARD (/advisor & /dashboard)
  // ─────────────────────────────────────────────────────────────
  console.log('Scene 6: AI Advisor & Dashboard');
  await page.goto('http://localhost:5000/advisor', { waitUntil: 'networkidle' });
  await setBanner(page, 'Scene 6 of 6 · AI Advisor', '24/7 Conversational Academic Guidance', 'Ask questions in Standard English or Nigerian Pidgin regarding electives & SIWES');
  await sleep(2000);

  // Type a sample question into AI Advisor input
  try {
    const chatTextarea = await page.$('textarea');
    if (chatTextarea) {
      await chatTextarea.click();
      await chatTextarea.fill('Which 300L/400L electives should I register to prepare for Software Engineering roles?');
      await sleep(1000);
      const sendBtn = await page.$('button[title="Send message"]');
      if (sendBtn) {
        await sendBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }
      await sleep(3500); // Allow AI response to render
    }
  } catch (e) {
    console.warn('AI Advisor query error:', e.message);
  }
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene6_advisor.png') });
  await sleep(1000);

  // Navigate to Dashboard
  console.log('Opening Student Dashboard...');
  await page.goto('http://localhost:5000/dashboard', { waitUntil: 'networkidle' });
  await setBanner(page, 'Personalized Student Dashboard', 'Academic Command Center · Standing: 400L · CGPA: 4.38', 'Calculated 96% Top Fit: Software Engineer · Derived Holland Code: IRC');
  await sleep(1500);
  await page.screenshot({ path: path.join(RECORDINGS_DIR, 'proof_scene6_dashboard.png') });
  await sleep(2000);

  // Smooth scroll down the dashboard to RIASEC distribution chart
  await smoothScroll(page, 550, 1600);
  await setBanner(page, 'PathWise · Career Decision Support System', 'Empowering DELSU Students with Empirical Career Confidence', 'Demo Walkthrough Complete');
  await sleep(3000);

  // Close context to finish recording and save video
  await page.close();
  await context.close();
  await browser.close();

  // Find the latest generated video file in RECORDINGS_DIR by modification time
  const files = fs.readdirSync(RECORDINGS_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ name: f, time: fs.statSync(path.join(RECORDINGS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 0) {
    const latestVideo = path.join(RECORDINGS_DIR, files[0].name);
    const projectDest = path.resolve('..', 'PathWise_Demo_Walkthrough.webm');
    const artifactDest = path.join('C:', 'Users', 'HP', '.gemini', 'antigravity', 'brain', '7f32fa40-039b-46a7-b50f-2feed5431fc4', 'PathWise_Demo_Walkthrough.webm');
    
    fs.copyFileSync(latestVideo, projectDest);
    console.log(`Saved project video: ${projectDest}`);

    try {
      fs.copyFileSync(latestVideo, artifactDest);
      console.log(`Saved artifact video: ${artifactDest}`);
    } catch (e) {
      console.warn('Could not copy to artifact dir:', e.message);
    }
  }

  // Copy proof screenshots to artifacts directory
  const proofFiles = fs.readdirSync(RECORDINGS_DIR).filter(f => f.startsWith('proof_') && f.endsWith('.png'));
  for (const pf of proofFiles) {
    try {
      const src = path.join(RECORDINGS_DIR, pf);
      const dst = path.join('C:', 'Users', 'HP', '.gemini', 'antigravity', 'brain', '7f32fa40-039b-46a7-b50f-2feed5431fc4', pf);
      fs.copyFileSync(src, dst);
      console.log(`Copied ${pf} to artifacts`);
    } catch (e) {}
  }

  console.log('Video recording completed successfully!');
})();
