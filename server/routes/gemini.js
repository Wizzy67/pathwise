import express from 'express';
import Groq from 'groq-sdk';
import { verifyToken } from '../middleware/auth.js';
import db from '../utils/db.js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Initialize Groq
const groqApiKey = process.env.GROQ_API_KEY;
const hasApiKey = !!groqApiKey;
const groq = hasApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast, smart, free-tier friendly

// Generate a chat title using Groq (or fallback)
const generateChatTitle = async (firstMessage) => {
  if (!hasApiKey) return firstMessage.substring(0, 30) + '...';
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'user', content: `Summarize this message into a short title of 2-4 words for a chat session. Respond with ONLY the title, no quotes, no explanation. Message: "${firstMessage}"` }
      ],
      max_tokens: 20,
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content?.trim() || firstMessage.substring(0, 30);
  } catch {
    return firstMessage.substring(0, 30) + '...';
  }
};

// Smart fallback responses when API is not available
const getSmartFallback = (prompt, user) => {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    return `Hello ${user.fullName}! 👋 I'm your PathWise AI Advisor. How can I help you with your career or academics at DELSU today?`;
  } else if (lowerPrompt.includes('career') || lowerPrompt.includes('job') || lowerPrompt.includes('work')) {
    return "Based on your department, there are many excellent career paths to consider. Roles in data analysis, software engineering, and specialized research are in high demand. Have you explored the Careers tab on your dashboard yet?";
  } else if (lowerPrompt.includes('course') || lowerPrompt.includes('study') || lowerPrompt.includes('read')) {
    return `Since you're in Level ${user.level}00, focus on building strong foundational skills in your core courses. Maintaining a strong CGPA opens up better internship opportunities. Remember to form study groups!`;
  } else if (lowerPrompt.includes('roadmap') || lowerPrompt.includes('plan') || lowerPrompt.includes('step')) {
    return "A good roadmap starts with mastering your current coursework, picking up relevant technical skills during holidays, and applying for internships by your 300 level. What specific field would you like a roadmap for?";
  } else if (lowerPrompt.includes('skill') || lowerPrompt.includes('learn') || lowerPrompt.includes('tool')) {
    return "The most valuable skills right now are problem-solving, digital literacy (like Python or Excel), and strong communication. Try Coursera or Udemy courses alongside your DELSU curriculum.";
  } else if (lowerPrompt.includes('salary') || lowerPrompt.includes('pay') || lowerPrompt.includes('money')) {
    return "Salaries vary by field, but tech, finance, and engineering tend to pay the highest entry-level wages in Nigeria. Focus on building high-value skills and financial rewards will follow!";
  } else {
    return "That's a great question! I recommend exploring the 'Career Explorer' section of your dashboard for detailed insights on various fields, including required skills and salary expectations.";
  }
};

// ── POST /chat ──────────────────────────────────────────────────────────────
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, prompt: bodyPrompt, history, language, sessionId } = req.body;
    const prompt = message || bodyPrompt || '';
    let user = await db.getUserById(req.user.id);
    if (!user) {
      user = await db.createUser({ id: req.user.id, fullName: 'Test User', matricNo: 'TEST/001' });
      user.id = req.user.id;
    }

    await db.logActivity(req.user.id, 'ai_query', { promptSnippet: prompt.substring(0, 50) });

    const systemContext = `You are PathWise AI, an expert career advisor for Delta State University (DELSU) students in Nigeria, powered by three evidence-based career theories.

STUDENT PROFILE:
- Name: ${user.fullName}, Level ${user.level}00, Department: ${user.department}
- CGPA: ${user.cgpa || 'unknown'}
- Language preference: ${language === 'pidgin' ? 'Nigerian Pidgin English' : 'English'}

CAREER THEORY DATA (use this to personalize all advice):

1. RIASEC (Holland's Theory of Career Choice):
   - Holland Code: ${user.hollandCode || 'Not yet assessed'}
   - Profile: ${user.hollandLabel || 'Take assessment to generate'}
   - Dimension Scores: ${user.riasecScores ? JSON.stringify(user.riasecScores) : 'Not yet assessed'}
   - The Holland Code means: R=Realistic(hands-on), I=Investigative(analytical), A=Artistic(creative), S=Social(helping), E=Enterprising(leadership), C=Conventional(structured)

2. SCCT (Social Cognitive Career Theory — Lent, Brown & Hackett):
   - Self-Efficacy per field (1-5): ${user.selfEfficacy ? JSON.stringify(user.selfEfficacy) : 'Not assessed'}
   - Career Values / Outcome Expectations (1-5): ${user.outcomeExpectations ? JSON.stringify(user.outcomeExpectations) : 'Not assessed'}
   - High self-efficacy fields are where the student feels most confident. High outcome ratings show what they value most.

3. Constructivist Learning Theory:
   - Dominant Learning Style: ${user.learningStyle || 'Not assessed'}
   - Prior Experiences: ${user.priorExperiences?.join(', ') || 'None recorded'}
   - Use these to suggest skill-building approaches tailored to how they learn best.

BEHAVIORAL INSTRUCTIONS:
1. For greetings (hi, hello, good morning etc.), respond warmly and conversationally — do NOT dump career advice immediately.
2. When giving career advice, reference the student's Holland Code, self-efficacy scores, and learning style naturally.
3. If Holland Code is not assessed yet, gently encourage them to take the assessment.
4. Use Socratic questioning occasionally to help the student reflect (Constructivist approach).
5. Acknowledge self-efficacy barriers and suggest confidence-building steps (SCCT approach).
6. Keep responses concise — 2-4 short paragraphs max. Be positive, warm, and encouraging.
7. Always ground advice in the Nigerian context: DELSU curriculum, Nigerian industry, local professional bodies.`;

    const userMessage = { role: 'user', content: prompt };
    let aiResponseText = '';

    if (hasApiKey) {
      try {
        // Build messages array for Groq (OpenAI-compatible format)
        const messages = [{ role: 'system', content: systemContext }];

        // Add conversation history
        const cleanHistory = (history || []).filter(m => m.content && m.content.trim());
        let startIdx = 0;
        while (startIdx < cleanHistory.length && cleanHistory[startIdx].role === 'assistant') startIdx++;

        for (const m of cleanHistory.slice(startIdx).slice(-10)) {
          messages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          });
        }

        // Add current user message
        messages.push({ role: 'user', content: prompt });

        const response = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages,
          max_tokens: 1024,
          temperature: 0.8,
        });

        aiResponseText = response.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
      } catch (groqError) {
        console.warn('Groq API failed, using smart fallback:', groqError.message);
        aiResponseText = getSmartFallback(prompt, user);
      }
    } else {
      aiResponseText = getSmartFallback(prompt, user);
      await new Promise(r => setTimeout(r, 800));
    }

    const aiMessage = { role: 'assistant', content: aiResponseText };
    let activeSessionId = sessionId;

    // Save to database
    if (activeSessionId) {
      await db.addMessagesToSession(activeSessionId, [userMessage, aiMessage]);
    } else {
      const title = await generateChatTitle(prompt);
      const newSession = await db.createChatSession(req.user.id, title, [userMessage, aiMessage]);
      activeSessionId = newSession.id;
    }

    res.json({ reply: aiResponseText, sessionId: activeSessionId });
  } catch (error) {
    console.error('chat error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI Advisor' });
  }
});

// ── GET /sessions ───────────────────────────────────────────────────────────
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const sessions = await db.getChatSessions(req.user.id);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// ── GET /sessions/:id ───────────────────────────────────────────────────────
router.get('/sessions/:id', verifyToken, async (req, res) => {
  try {
    const session = await db.getChatSessionById(req.params.id);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// ── POST /study-plan ────────────────────────────────────────────────────────
router.post('/study-plan', verifyToken, async (req, res) => {
  try {
    const { targetCareerId } = req.body;
    const user = await db.getUserById(req.user.id);

    if (hasApiKey) {
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'user', content: `Generate a short weekly study plan for a Level ${user.level}00 DELSU student aiming for career ID ${targetCareerId}. Keep it concise and practical.` }
        ],
        max_tokens: 512,
      });
      res.json({ plan: response.choices[0]?.message?.content });
    } else {
      res.json({ plan: "Mock Study Plan:\nMonday: Review past questions\nTuesday: Group study\nWednesday: Practical coding/labs" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// ── POST /career-detail ─────────────────────────────────────────────────────
router.post('/career-detail', verifyToken, async (req, res) => {
  try {
    const { careerId, careerTitle, careerField } = req.body;
    const user = await db.getUserById(req.user.id);
    const department = user?.department || 'General Studies';
    const level = user?.level || 1;
    const cgpa = user?.cgpa || 'N/A';

    if (hasApiKey) {
      const promptText = `You are a career guidance expert for Nigerian university students at Delta State University (DELSU).
Generate a detailed career profile JSON for the career: "${careerTitle}" (field: ${careerField}).
The student is in ${department}, Level ${level}00, CGPA: ${cgpa}.

Return ONLY valid JSON (no markdown, no explanation) in this exact structure:
{
  "overview": "3-4 sentence paragraph about this career in the Nigerian context",
  "whyItMatters": "2-3 sentences about why this career is important in Nigeria today",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "qualifications": {
    "degree": "Relevant degree program at DELSU",
    "certifications": ["cert1", "cert2"],
    "relevant": "Other relevant professional qualifications in Nigeria"
  },
  "roadmap": [
    { "sem": "Year 1 - Semester 1", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 1 - Semester 2", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 2 - Semester 1", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 2 - Semester 2", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 3 - Semester 1", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 3 - Semester 2", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 4 - Semester 1", "courses": ["Course1", "Course2", "Course3"] },
    { "sem": "Year 4 - Semester 2 (Final)", "courses": ["Final Year Project", "Internship/SIWES", "Professional Ethics"] }
  ],
  "skillGapData": [
    { "skill": "Skill A", "current": 40, "required": 80 },
    { "skill": "Skill B", "current": 55, "required": 85 },
    { "skill": "Skill C", "current": 30, "required": 75 },
    { "skill": "Skill D", "current": 60, "required": 90 },
    { "skill": "Skill E", "current": 45, "required": 80 }
  ],
  "careerOutlook": "2-3 sentences about the job market and salary growth trajectory in Nigeria",
  "topEmployers": ["Employer1", "Employer2", "Employer3", "Employer4"]
}`;

      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 2048,
        temperature: 0.4,
      });

      let text = response.choices[0]?.message?.content?.trim() || '';
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
      const data = JSON.parse(text);
      await db.logActivity(req.user.id, 'roadmap_viewed', { careerId });
      res.json(data);
    } else {
      res.json({
        overview: `${careerTitle} is a dynamic and rewarding career path in Nigeria. Professionals in this field are highly sought after across public and private sectors.`,
        whyItMatters: 'This career plays a critical role in Nigeria\'s economic development and social progress.',
        skills: ['Critical Thinking', 'Communication', 'Research', 'Leadership', 'Teamwork', 'Problem Solving'],
        qualifications: { degree: `B.Sc. in relevant field at DELSU`, certifications: ['Professional certification'], relevant: 'Post-graduate study or professional membership' },
        roadmap: [
          { sem: 'Year 1 - Semester 1', courses: ['Foundation Course A', 'Foundation Course B', 'General Studies'] },
          { sem: 'Year 1 - Semester 2', courses: ['Core Course A', 'Core Course B', 'Elective'] },
          { sem: 'Year 2 - Semester 1', courses: ['Intermediate Course A', 'Intermediate Course B', 'Lab Practice'] },
          { sem: 'Year 2 - Semester 2', courses: ['Intermediate Course C', 'Research Methods', 'Statistics'] },
          { sem: 'Year 3 - Semester 1', courses: ['Advanced Course A', 'Advanced Course B', 'Field Work'] },
          { sem: 'Year 3 - Semester 2', courses: ['Specialization A', 'Specialization B', 'Project Proposal'] },
          { sem: 'Year 4 - Semester 1', courses: ['Advanced Specialization', 'Industry Practice', 'Seminar'] },
          { sem: 'Year 4 - Semester 2 (Final)', courses: ['Final Year Project', 'Internship/SIWES', 'Professional Ethics'] },
        ],
        skillGapData: [
          { skill: 'Core Skill', current: 50, required: 80 },
          { skill: 'Technical', current: 40, required: 85 },
          { skill: 'Soft Skills', current: 65, required: 75 },
          { skill: 'Industry Know.', current: 30, required: 90 },
          { skill: 'Research', current: 55, required: 80 },
        ],
        careerOutlook: 'The job market is positive with growing demand in Nigeria.',
        topEmployers: ['Federal Government', 'State Government', 'Private Sector Firms', 'NGOs'],
      });
    }
  } catch (error) {
    console.error('career-detail error:', error);
    res.status(500).json({ error: 'Failed to generate career detail' });
  }
});

// Delete Chat Session
router.delete('/sessions/:id', verifyToken, async (req, res) => {
  try {
    const success = await db.deleteChatSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
