import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { dataCache } from '../server.js';

const router = express.Router();

// ── Curated Nigerian Job Listings Database ──
// Rich, realistic job postings covering major Nigerian employers and remote positions
const CURATED_JOBS = [
  // STEM / Technology
  { id: 'j_1', title: 'Frontend Developer', company: 'Andela', location: 'Lagos, Nigeria (Remote)', type: 'Full-time', salary: '₦4M – ₦8M/yr', field: 'STEM', posted: '2 days ago', url: 'https://andela.com/careers', logo: '🟢', tags: ['React', 'TypeScript', 'Remote'] },
  { id: 'j_2', title: 'Backend Engineer', company: 'Paystack (Stripe)', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦6M – ₦12M/yr', field: 'STEM', posted: '1 day ago', url: 'https://paystack.com/careers', logo: '🔵', tags: ['Node.js', 'APIs', 'Fintech'] },
  { id: 'j_3', title: 'Data Analyst', company: 'Flutterwave', location: 'Lagos, Nigeria (Hybrid)', type: 'Full-time', salary: '₦3.5M – ₦7M/yr', field: 'STEM', posted: '3 days ago', url: 'https://flutterwave.com/careers', logo: '🟡', tags: ['SQL', 'Python', 'Analytics'] },
  { id: 'j_4', title: 'Mobile Developer (Flutter)', company: 'Kuda Bank', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦5M – ₦10M/yr', field: 'STEM', posted: '5 days ago', url: 'https://kudabank.com/careers', logo: '🟣', tags: ['Flutter', 'Dart', 'Mobile'] },
  { id: 'j_5', title: 'Cloud Engineer', company: 'MainOne (Equinix)', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦5M – ₦9M/yr', field: 'STEM', posted: '1 week ago', url: 'https://mainone.net/careers', logo: '☁️', tags: ['AWS', 'DevOps', 'Kubernetes'] },
  { id: 'j_6', title: 'Junior Software Developer', company: 'Interswitch', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2.5M – ₦5M/yr', field: 'STEM', posted: '4 days ago', url: 'https://interswitch.com/careers', logo: '🔶', tags: ['Java', 'Spring Boot', 'Fintech'] },
  { id: 'j_7', title: 'AI/ML Intern', company: 'Data Science Nigeria', location: 'Remote, Nigeria', type: 'Internship', salary: '₦100K – ₦250K/mo', field: 'STEM', posted: '2 days ago', url: 'https://datasciencenigeria.org', logo: '🤖', tags: ['Python', 'ML', 'Research'] },
  { id: 'j_8', title: 'Cybersecurity Analyst', company: 'SystemSpecs', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦4M – ₦8M/yr', field: 'STEM', posted: '6 days ago', url: 'https://systemspecs.com.ng/careers', logo: '🛡️', tags: ['Security', 'SIEM', 'Networks'] },
  { id: 'j_9', title: 'Product Designer (UX)', company: 'Piggyvest', location: 'Lagos, Nigeria (Remote)', type: 'Full-time', salary: '₦4M – ₦9M/yr', field: 'STEM', posted: '3 days ago', url: 'https://piggyvest.com', logo: '🎨', tags: ['Figma', 'UX Research', 'Design Systems'] },
  { id: 'j_10', title: 'Full Stack Engineer', company: 'Moniepoint', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦5M – ₦12M/yr', field: 'STEM', posted: '1 day ago', url: 'https://moniepoint.com/careers', logo: '💳', tags: ['React', 'Node.js', 'Fintech'] },

  // Medicine
  { id: 'j_11', title: 'Medical Officer', company: 'Federal Medical Centre, Asaba', location: 'Asaba, Delta', type: 'Full-time', salary: '₦3M – ₦6M/yr', field: 'Medicine', posted: '1 week ago', url: 'https://health.gov.ng', logo: '🏥', tags: ['Clinical', 'MBBS', 'NYSC'] },
  { id: 'j_12', title: 'Pharmacist', company: 'HealthPlus Pharmacy', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2.5M – ₦5M/yr', field: 'Medicine', posted: '5 days ago', url: 'https://healthplus.com.ng', logo: '💊', tags: ['Pharmacy', 'PCN', 'Retail'] },
  { id: 'j_13', title: 'Public Health Analyst', company: 'WHO Nigeria', location: 'Abuja, Nigeria', type: 'Contract', salary: '₦6M – ₦10M/yr', field: 'Medicine', posted: '3 days ago', url: 'https://who.int/nigeria', logo: '🌍', tags: ['Epidemiology', 'Data', 'Global Health'] },
  { id: 'j_14', title: 'Nursing Officer', company: 'Reddington Hospital', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2M – ₦4M/yr', field: 'Medicine', posted: '4 days ago', url: 'https://reddingtonhospital.com', logo: '🩺', tags: ['Nursing', 'Critical Care', 'NMC'] },

  // Law
  { id: 'j_15', title: 'Associate Lawyer', company: 'Aluko & Oyebode', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦3M – ₦8M/yr', field: 'Law', posted: '1 week ago', url: 'https://aluko-oyebode.com/careers', logo: '⚖️', tags: ['Corporate Law', 'M&A', 'NBA'] },
  { id: 'j_16', title: 'Legal Intern', company: 'Banwo & Ighodalo', location: 'Lagos, Nigeria', type: 'Internship', salary: '₦80K – ₦150K/mo', field: 'Law', posted: '2 days ago', url: 'https://banwo-ighodalo.com', logo: '📜', tags: ['Research', 'Drafting', 'Litigation'] },
  { id: 'j_17', title: 'Compliance Officer', company: 'GTBank', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦4M – ₦7M/yr', field: 'Law', posted: '5 days ago', url: 'https://gtbank.com/careers', logo: '🏛️', tags: ['Compliance', 'Regulatory', 'Banking'] },

  // Business
  { id: 'j_18', title: 'Financial Analyst', company: 'PwC Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦4M – ₦8M/yr', field: 'Business', posted: '3 days ago', url: 'https://pwc.com/ng/careers', logo: '📊', tags: ['Finance', 'Excel', 'Modelling'] },
  { id: 'j_19', title: 'Marketing Executive', company: 'Jumia Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2M – ₦4.5M/yr', field: 'Business', posted: '1 day ago', url: 'https://jumia.com.ng/careers', logo: '📦', tags: ['Digital Marketing', 'SEO', 'E-commerce'] },
  { id: 'j_20', title: 'Management Trainee', company: 'Dangote Group', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦3M – ₦5M/yr', field: 'Business', posted: '1 week ago', url: 'https://dangote.com/careers', logo: '🏭', tags: ['Operations', 'Management', 'Graduate'] },
  { id: 'j_21', title: 'Audit Associate', company: 'KPMG Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦3.5M – ₦6M/yr', field: 'Business', posted: '4 days ago', url: 'https://kpmg.com/ng/careers', logo: '🔍', tags: ['Audit', 'ICAN', 'Accounting'] },

  // Engineering
  { id: 'j_22', title: 'Civil Engineer', company: 'Julius Berger Nigeria', location: 'Abuja, Nigeria', type: 'Full-time', salary: '₦4M – ₦9M/yr', field: 'Engineering', posted: '6 days ago', url: 'https://julius-berger.com/careers', logo: '🏗️', tags: ['Construction', 'COREN', 'Project Mgmt'] },
  { id: 'j_23', title: 'Electrical Engineer', company: 'Schneider Electric Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦3.5M – ₦7M/yr', field: 'Engineering', posted: '5 days ago', url: 'https://se.com/ng/careers', logo: '⚡', tags: ['Power Systems', 'AutoCAD', 'COREN'] },

  // Science
  { id: 'j_24', title: 'Lab Scientist', company: 'Nigerian Institute of Medical Research', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2.5M – ₦5M/yr', field: 'Science', posted: '1 week ago', url: 'https://nimr.gov.ng', logo: '🔬', tags: ['Microbiology', 'Lab', 'Research'] },
  { id: 'j_25', title: 'Environmental Scientist', company: 'Shell Nigeria', location: 'Port Harcourt, Nigeria', type: 'Full-time', salary: '₦5M – ₦10M/yr', field: 'Science', posted: '3 days ago', url: 'https://shell.com.ng/careers', logo: '🌿', tags: ['Environmental', 'EIA', 'Oil & Gas'] },

  // Arts / Social Sciences
  { id: 'j_26', title: 'Content Writer', company: 'TechCabal', location: 'Lagos (Remote)', type: 'Full-time', salary: '₦2M – ₦4M/yr', field: 'Arts', posted: '2 days ago', url: 'https://techcabal.com/careers', logo: '✍️', tags: ['Writing', 'Tech', 'Journalism'] },
  { id: 'j_27', title: 'Social Media Manager', company: 'Wild Fusion', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2M – ₦4.5M/yr', field: 'Arts', posted: '4 days ago', url: 'https://wildfusion.com', logo: '📱', tags: ['Social Media', 'Strategy', 'Analytics'] },
  { id: 'j_28', title: 'Research Assistant', company: 'University of Lagos', location: 'Lagos, Nigeria', type: 'Contract', salary: '₦1.5M – ₦3M/yr', field: 'Social Sciences', posted: '1 week ago', url: 'https://unilag.edu.ng', logo: '📚', tags: ['Research', 'Academia', 'Social Science'] },
  { id: 'j_29', title: 'HR Coordinator', company: 'MTN Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦3M – ₦6M/yr', field: 'Social Sciences', posted: '5 days ago', url: 'https://mtn.ng/careers', logo: '👥', tags: ['HR', 'Recruitment', 'People Ops'] },
  { id: 'j_30', title: 'Graduate Trainee Program', company: 'Access Bank', location: 'Lagos, Nigeria', type: 'Full-time', salary: '₦2.5M – ₦4M/yr', field: 'Business', posted: '2 days ago', url: 'https://accessbankplc.com/careers', logo: '🏦', tags: ['Banking', 'Graduate', 'Finance'] },
];

// Helper: map career title keywords to job search terms
const careerToSearchTerms = (careerTitle) => {
  const title = careerTitle.toLowerCase();
  const termMap = {
    'software': ['software', 'developer', 'engineer', 'full stack', 'frontend', 'backend'],
    'data': ['data', 'analyst', 'scientist', 'ml', 'ai'],
    'medical': ['medical', 'doctor', 'clinical', 'health', 'nursing'],
    'pharmacist': ['pharmacist', 'pharmacy'],
    'lawyer': ['lawyer', 'legal', 'law', 'compliance', 'associate'],
    'accountant': ['audit', 'accounting', 'finance', 'analyst', 'ICAN'],
    'engineer': ['engineer', 'engineering', 'civil', 'electrical'],
    'marketing': ['marketing', 'content', 'social media', 'digital'],
    'teacher': ['teacher', 'education', 'lecturer', 'research assistant'],
    'nurse': ['nurse', 'nursing', 'clinical'],
    'scientist': ['scientist', 'lab', 'research', 'environmental'],
  };

  for (const [key, terms] of Object.entries(termMap)) {
    if (title.includes(key)) return terms;
  }
  return title.split(/\s+/);
};

// GET /api/jobs?field=STEM&career=Software+Engineer&limit=6
router.get('/', verifyToken, async (req, res) => {
  try {
    const { field, career, limit = 6 } = req.query;
    let jobs = [...CURATED_JOBS];

    // Filter by field if provided
    if (field) {
      jobs = jobs.filter(j => j.field.toLowerCase() === field.toLowerCase());
    }

    // Filter by career relevance if provided
    if (career) {
      const searchTerms = careerToSearchTerms(career);
      jobs = jobs.filter(j => {
        const haystack = `${j.title} ${j.tags.join(' ')} ${j.company}`.toLowerCase();
        return searchTerms.some(term => haystack.includes(term.toLowerCase()));
      });

      // If no exact matches found, fall back to field-based results
      if (jobs.length === 0 && field) {
        jobs = CURATED_JOBS.filter(j => j.field.toLowerCase() === field.toLowerCase());
      }
    }

    // Randomize order slightly to simulate "live" feed feel
    jobs = jobs.sort(() => Math.random() - 0.5);

    // Limit results
    const maxResults = Math.min(parseInt(limit), 10);
    jobs = jobs.slice(0, maxResults);

    res.json({
      jobs,
      total: jobs.length,
      source: 'PathWise Job Board',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('[JOBS] Error fetching job listings:', error);
    res.status(500).json({ error: 'Failed to fetch job listings' });
  }
});

// GET /api/jobs/all — returns all jobs (for the explorer job board tab)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const { field, search, limit = 20 } = req.query;
    let jobs = [...CURATED_JOBS];

    if (field) {
      jobs = jobs.filter(j => j.field.toLowerCase() === field.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j => {
        const haystack = `${j.title} ${j.company} ${j.tags.join(' ')} ${j.location}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    const maxResults = Math.min(parseInt(limit), 30);
    jobs = jobs.slice(0, maxResults);

    res.json({
      jobs,
      total: jobs.length,
      source: 'PathWise Job Board',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('[JOBS] Error fetching all jobs:', error);
    res.status(500).json({ error: 'Failed to fetch job listings' });
  }
});

export default router;
