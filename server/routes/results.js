import express from 'express';
import db from '../utils/db.js';
import { verifyToken } from '../middleware/auth.js';
import { dataCache } from '../server.js';

const router = express.Router();

const CATEGORY_MAPS = {
  Technology: ['CSC', 'IFT', 'SEN', 'COE'],
  Quantitative: ['MTH', 'STA', 'PHY'],
  Sciences: ['CHM', 'BIO', 'BCH', 'MCB', 'GEL'],
  HealthSciences: ['ANA', 'PHS', 'PCO', 'MED', 'NUR', 'PHM'],
  BusinessEconomics: ['ECO', 'ACC', 'BUS', 'BFN', 'MKT'],
  LawJurisprudence: ['LAW', 'JUR', 'CLW', 'PIL'],
  ArtsCommunication: ['ENG', 'LIT', 'MCM', 'FA', 'THE', 'HIS'],
  SocialSciences: ['SOC', 'PSY', 'POL', 'GEO']
};

const GRADE_VALUES = {
  A: 5, B: 4, C: 3, D: 2, E: 1, F: 0
};

// Map academic categories to career fields
const CAREER_FIELD_MAPS = {
  Technology: 'STEM',
  Quantitative: 'STEM',
  Sciences: 'Science',
  HealthSciences: 'Medicine',
  BusinessEconomics: 'Business',
  LawJurisprudence: 'Law',
  ArtsCommunication: 'Arts',
  SocialSciences: 'Social Sciences'
};

const performAnalysis = (results) => {
  if (!Array.isArray(results) || results.length === 0) {
    return { strengths: [], weaknesses: [], recommendations: [] };
  }

  // Calculate scores per category
  const categoryScores = {};
  const categoryCounts = {};

  results.forEach(res => {
    const courseCode = String(res.courseCode || '').toUpperCase().trim();
    const grade = String(res.grade || 'C').toUpperCase().trim();
    const score = GRADE_VALUES[grade] ?? 3;

    // Extract prefix, e.g. CSC 301 -> CSC
    const match = courseCode.match(/^([A-Z]{2,4})/);
    if (!match) return;
    const prefix = match[1];

    // Find category for prefix
    let category = 'SocialSciences'; // Default fallback
    for (const [catName, prefixes] of Object.entries(CATEGORY_MAPS)) {
      if (prefixes.includes(prefix)) {
        category = catName;
        break;
      }
    }

    categoryScores[category] = (categoryScores[category] || 0) + score;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const categoryAverages = {};
  for (const catName in categoryScores) {
    categoryAverages[catName] = categoryScores[catName] / categoryCounts[catName];
  }

  const strengths = [];
  const weaknesses = [];

  for (const [catName, avg] of Object.entries(categoryAverages)) {
    const prettyName = catName.replace(/([A-Z])/g, ' $1').trim();
    if (avg >= 4.0) {
      strengths.push({
        category: catName,
        name: prettyName,
        score: avg,
        description: `Excellent performance (Avg Grade: ${avg >= 4.5 ? 'A' : 'B'}) indicating strong cognitive aptitude.`
      });
    } else if (avg < 2.5) {
      weaknesses.push({
        category: catName,
        name: prettyName,
        score: avg,
        description: `Needs improvement (Avg Grade: D/E/F). Suggest building study plan frameworks.`
      });
    }
  }

  // Map to matching careers
  const topCategories = Object.keys(categoryAverages).sort((a, b) => categoryAverages[b] - categoryAverages[a]);
  const primaryField = CAREER_FIELD_MAPS[topCategories[0]] || 'STEM';

  const recommendations = (dataCache?.careers || [])
    .filter(c => c.field === primaryField)
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      title: c.title,
      field: c.field,
      matchingScore: Math.round(75 + (categoryAverages[topCategories[0]] || 3.0) * 4)
    }));

  return { strengths, weaknesses, recommendations };
};

// GET results and saved analysis
router.get('/analysis', verifyToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const results = user.uploadedResults || [];
    const analysis = performAnalysis(results);

    res.json({ results, analysis });
  } catch (error) {
    console.error('Fetch analysis error:', error);
    res.status(500).json({ error: 'Failed to retrieve results analysis' });
  }
});

// POST analyze, save and return results
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) {
      return res.status(400).json({ error: 'Results array is required' });
    }

    // Clean data format
    const cleanedResults = results.map(r => ({
      courseCode: String(r.courseCode || '').toUpperCase().trim(),
      courseTitle: String(r.courseTitle || '').trim(),
      grade: String(r.grade || 'C').toUpperCase().trim()
    })).filter(r => r.courseCode.length > 0);

    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save to user object in database
    await db.updateUser(req.user.id, { uploadedResults: cleanedResults });
    await db.logActivity(req.user.id, 'results_uploaded', { count: cleanedResults.length });

    const analysis = performAnalysis(cleanedResults);

    res.json({ results: cleanedResults, analysis });
  } catch (error) {
    console.error('Analyze results error:', error);
    res.status(500).json({ error: 'Failed to process and save academic analysis' });
  }
});

export default router;
