import express from 'express';
import db from '../utils/db.js';
import { verifyToken } from '../middleware/auth.js';
import { dataCache } from '../server.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// RIASEC Holland Code dimension labels
// ─────────────────────────────────────────────────────────────────────────────
const RIASEC_LABELS = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional'
};

// ─────────────────────────────────────────────────────────────────────────────
// Constructivist learning style → RIASEC affinity boost
// ─────────────────────────────────────────────────────────────────────────────
const LEARNING_STYLE_BOOST = {
  hands_on:     { R: 8 },
  research:     { I: 8 },
  creative:     { A: 8 },
  collaborative:{ S: 8 },
  leadership:   { E: 8 },
  structured:   { C: 8 }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCCT field → selfEfficacy key mapping
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_EFFICACY_MAP = {
  STEM:            'STEM',
  Medicine:        'Medicine',
  Law:             'Law',
  Business:        'Business',
  Arts:            'Arts',
  'Social Sciences':'Social Sciences',
  Science:         'Science'
};

/**
 * THREE-THEORY CAREER MATCHING ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Theory 1 — RIASEC (Holland, 1959)
 *   Scores each personality dimension R/I/A/S/E/C from 18 Likert statements.
 *   Derives a 3-letter Holland Code from the top 3 dimensions.
 *   Career match = Holland Code similarity to career's holland_code field.
 *
 * Theory 2 — SCCT (Lent, Brown & Hackett, 1994)
 *   Self-Efficacy: student confidence per career field (1-5 scale)
 *   Outcome Expectations: what the student values (income, impact, creativity…)
 *
 * Theory 3 — Constructivist Learning Theory
 *   Prior experiences with career-relevant activities boost matching scores.
 *   Learning style maps back to RIASEC affinity for a small bonus.
 *
 * Combined weights:
 *   RIASEC similarity    → up to 50 pts
 *   SCCT self-efficacy   → up to 25 pts
 *   Outcome expectations → up to 15 pts
 *   Constructivist prior → up to 10 pts
 *   CGPA modifier        → ±bonus/penalty
 * ─────────────────────────────────────────────────────────────────────────────
 */
const calculateMatches = (answers, cgpa, faculty, level) => {
  const careers = dataCache.careers;

  // ── THEORY 1: RIASEC ─────────────────────────────────────────────
  const riasecRaw = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  if (answers.riasec && typeof answers.riasec === 'object') {
    Object.entries(answers.riasec).forEach(([dim, ratings]) => {
      if (riasecRaw.hasOwnProperty(dim) && Array.isArray(ratings)) {
        riasecRaw[dim] = ratings.reduce((sum, r) => sum + (parseInt(r) || 0), 0);
      }
    });
  }

  // Constructivist: learning style adds a small RIASEC boost
  const learningBoost = LEARNING_STYLE_BOOST[answers.learningStyle] || {};
  Object.entries(learningBoost).forEach(([dim, bonus]) => {
    riasecRaw[dim] = (riasecRaw[dim] || 0) + bonus;
  });

  // Normalize each dimension to 0-100 (3 statements × max 5 = 15 raw max, +8 boost max)
  const MAX_RAW = 23;
  const riasecScores = {};
  Object.entries(riasecRaw).forEach(([k, v]) => {
    riasecScores[k] = Math.min(100, Math.round((v / MAX_RAW) * 100));
  });

  // Derive Holland Code — top 3 dimensions by score
  const sortedDims = Object.entries(riasecScores).sort((a, b) => b[1] - a[1]);
  const hollandCode = sortedDims.slice(0, 3).map(([k]) => k).join('');
  const hollandLabel = hollandCode
    .split('')
    .map(k => RIASEC_LABELS[k] || k)
    .join(' · ');

  // ── THEORY 2: SCCT ───────────────────────────────────────────────
  const selfEfficacy        = answers.selfEfficacy        || {};
  const outcomeExpectations = answers.outcomeExpectations || {};

  // ── THEORY 3: Constructivist ─────────────────────────────────────
  const priorExperiences = Array.isArray(answers.priorExperiences)
    ? answers.priorExperiences
    : [];

  // ── COMPOSITE CAREER MATCHING ─────────────────────────────────────
  const rawMatches = careers.map(career => {
    let totalScore = 0;

    // --- Component 1: RIASEC (max ~50 pts) ---
    const careerCodes = Array.isArray(career.holland_code) ? career.holland_code : [];
    let riasecScore = 0;

    if (careerCodes[0]) {
      if (hollandCode[0] === careerCodes[0]) riasecScore += 30;       // perfect primary match
      else if (hollandCode.includes(careerCodes[0])) riasecScore += 18; // primary in student top-3
    }
    if (careerCodes[1]) {
      if (hollandCode[1] === careerCodes[1]) riasecScore += 14;
      else if (hollandCode.includes(careerCodes[1])) riasecScore += 8;
    }
    if (careerCodes[2]) {
      if (hollandCode[2] === careerCodes[2]) riasecScore += 6;
      else if (hollandCode.includes(careerCodes[2])) riasecScore += 3;
    }
    totalScore += riasecScore;

    // --- Component 2: SCCT Self-Efficacy (max 25 pts) ---
    const fieldKey       = FIELD_EFFICACY_MAP[career.field] || career.field;
    const efficacyRating = parseInt(selfEfficacy[fieldKey]) || 3;
    totalScore += (efficacyRating / 5) * 25;

    // --- Component 3: SCCT Outcome Expectations (max 15 pts) ---
    const careerOutcomes = Array.isArray(career.outcome_tags) ? career.outcome_tags : [];
    const studentHighValues = Object.entries(outcomeExpectations)
      .filter(([, v]) => (parseInt(v) || 0) >= 4)
      .map(([k]) => k);
    const outcomeMatchCount = careerOutcomes.filter(t => studentHighValues.includes(t)).length;
    const outcomeScore      = careerOutcomes.length > 0
      ? (outcomeMatchCount / careerOutcomes.length) * 15
      : 5;
    totalScore += outcomeScore;

    // --- Component 4: Constructivist Prior Experiences (max 10 pts) ---
    const expTags     = Array.isArray(career.experience_tags) ? career.experience_tags : [];
    const expMatches  = priorExperiences.filter(e => expTags.includes(e)).length;
    totalScore       += Math.min(10, expMatches * 3.5);

    // --- Component 5: Faculty Alignment (academic affinity boost) ---
    if (faculty) {
      const fac = faculty.toLowerCase();
      const cField = career.field.toLowerCase();
      let isAligned = false;
      if ((fac.includes('science') || fac.includes('engineering')) && (cField === 'stem' || cField === 'science')) isAligned = true;
      else if (fac.includes('medicine') && cField === 'medicine') isAligned = true;
      else if (fac.includes('law') && cField === 'law') isAligned = true;
      else if (fac.includes('management') && cField === 'business') isAligned = true;
      else if (fac.includes('arts') && (cField === 'arts' || cField === 'social sciences')) isAligned = true;
      else if (fac.includes('agriculture') && (cField === 'science' || cField === 'agriculture')) isAligned = true;
      
      if (isAligned) totalScore += 5; // academic affinity boost
    }

    // --- Component 6: Level of Study Calibration ---
    if (level) {
      const lvl = parseInt(level) || 100;
      if (lvl >= 300) totalScore += 2; // minor seniority alignment adjustment
    }

    // --- CGPA modifier ---
    const activeCgpa = parseFloat(cgpa || answers.cgpa);
    if (activeCgpa) {
      const reqCgpa = parseFloat(career.required_cgpa_hint) || 2.0;
      if (activeCgpa < reqCgpa) {
        totalScore -= (reqCgpa - activeCgpa) * 8;
      } else {
        totalScore += (activeCgpa - reqCgpa) * 2.5;
      }
    }

    // Clamp to [30, 98]
    const finalScore = Math.min(98, Math.max(30, Math.round(totalScore)));
    return { careerId: career.id, score: finalScore };
  });

  const matches = rawMatches.sort((a, b) => b.score - a.score);

  return {
    matches,
    hollandCode,
    hollandLabel,
    riasecScores,
    selfEfficacy,
    outcomeExpectations,
    learningStyle: answers.learningStyle || '',
    priorExperiences
  };
};

// ── POST /results — submit assessment ────────────────────────────────────────
router.post('/results', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const user = await db.getUserById(req.user.id);

    const userCgpa = parseFloat(answers.cgpa) || user.cgpa;
    const result   = calculateMatches(answers, userCgpa, user.faculty, user.level);

    const {
      matches, hollandCode, hollandLabel,
      riasecScores, selfEfficacy, outcomeExpectations,
      learningStyle, priorExperiences
    } = result;

    await db.updateUser(req.user.id, {
      cgpa: userCgpa,
      quizResults: matches,
      hollandCode,
      hollandLabel,
      riasecScores,
      selfEfficacy,
      outcomeExpectations,
      learningStyle,
      priorExperiences,
      lastQuizDate: new Date().toISOString()
    });

    await db.logActivity(req.user.id, 'quiz_completed', {
      topCareer:   matches[0]?.careerId,
      hollandCode
    });

    res.json({ matches, hollandCode, hollandLabel, riasecScores });
  } catch (error) {
    console.error('Save assessment results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /results — fetch stored results ──────────────────────────────────────
router.get('/results', verifyToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    res.json({
      matches:            user.quizResults        || [],
      hollandCode:        user.hollandCode         || null,
      hollandLabel:       user.hollandLabel        || null,
      riasecScores:       user.riasecScores        || null,
      selfEfficacy:       user.selfEfficacy        || null,
      outcomeExpectations:user.outcomeExpectations || null,
      learningStyle:      user.learningStyle       || null,
      lastQuizDate:       user.lastQuizDate
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
