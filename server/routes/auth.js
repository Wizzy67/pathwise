import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { generateToken } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/email.js';

const router = express.Router();

// Register Student
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, matricNo, faculty, department, level, cgpa, password } = req.body;

    const existingUser = await db.getUserByMatric(matricNo);
    if (existingUser) {
      return res.status(400).json({ error: 'Matric number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      fullName,
      email,
      matricNo,
      faculty,
      department,
      level,
      cgpa: parseFloat(cgpa) || null,
      password: hashedPassword,
      role: 'student'
    });

    await db.logActivity(newUser.id, 'registered');

    // Send welcome email asynchronously
    sendWelcomeEmail(newUser.email || `${matricNo}@student.delsu.edu.ng`, newUser.fullName)
      .then(emailResult => {
        if (emailResult && emailResult.previewUrl) {
          console.log(`💡 [EMAIL DISPATCHED] Ethereal Link: ${emailResult.previewUrl}`);
        }
      })
      .catch(err => console.error('[EMAIL ERROR] Welcome email dispatch failed:', err));

    const token = generateToken({ id: newUser.id, role: 'student', matricNo });
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        matricNo: newUser.matricNo,
        level: newUser.level,
        xp: newUser.xp,
        cgpa: newUser.cgpa,
        savedCareers: newUser.savedCareers || []
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ error: 'Server error during registration', detail: error.message });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.matricNo || req.body.email || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your Matric Number or Email and Password' });
    }

    console.log(`[AUTH] Login attempt for identifier: "${identifier}"`);

    // Try finding user by Matric Number, then by Email
    let user = await db.getUserByMatric(identifier);
    if (!user) {
      user = await db.getUserByEmail(identifier);
    }

    if (!user) {
      console.warn(`[AUTH] User not found for: "${identifier}"`);
      return res.status(400).json({ error: 'No account found with this Matric Number or Email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Password mismatch for user: "${user.matricNo}" ("${user.email}")`);
      return res.status(400).json({ error: 'Incorrect password' });
    }

    console.log(`[AUTH] Successful login for: "${user.matricNo}" (${user.fullName})`);
    await db.logActivity(user.id, 'logged_in');

    const token = generateToken({ id: user.id, role: user.role || 'student', matricNo: user.matricNo });
    
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        matricNo: user.matricNo,
        level: user.level,
        xp: user.xp,
        cgpa: user.cgpa,
        savedCareers: user.savedCareers || []
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Server error during login', detail: error.message });
  }
});

// Admin Login (Secret Route)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pathwise.app';
    const adminPassword = process.env.ADMIN_PASSWORD || 'PathwiseAdmin2026!'; // fallback for POC

    const inputIdent = email || username;
    const adminIdent = adminEmail.split('@')[0]; // e.g. "admin"

    if ((inputIdent === adminEmail || inputIdent === adminIdent) && password === adminPassword) {
      const token = generateToken({ id: 'admin-1', role: 'admin' }, true);
      res.json({
        token,
        user: { id: 'admin-1', role: 'admin', name: 'System Administrator' }
      });
    } else {
      res.status(400).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

export default router;
