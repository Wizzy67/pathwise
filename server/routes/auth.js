import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { generateToken } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';

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

// Request Password Reset (Forgot Password)
router.post('/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || req.body.identifier || req.body.matricNo || '').trim();

    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered student email address.' });
    }

    // Lookup user by email first, fallback to matric
    let user = await db.getUserByEmail(email);
    if (!user) {
      user = await db.getUserByMatric(email);
    }

    if (!user) {
      return res.status(404).json({ error: 'No student account was found with this email address.' });
    }

    // Generate secure 6-digit OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Save to user record
    await db.updateUser(user.id, {
      resetPasswordCode: resetCode,
      resetPasswordExpires: resetExpires
    });

    const targetEmail = user.email || `${user.matricNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.delsu.edu.ng`;

    // Masked email hint (e.g. i***@gmail.com)
    const emailParts = targetEmail.split('@');
    const maskedName = emailParts[0].length > 2 
      ? emailParts[0].charAt(0) + '***' + emailParts[0].slice(-1)
      : emailParts[0].charAt(0) + '***';
    const emailHint = `${maskedName}@${emailParts[1] || 'delsu.edu.ng'}`;

    console.log(`\n======================================================`);
    console.log(`🔑 [PASSWORD RESET OTP DISPATCHED]`);
    console.log(`   Student: ${user.fullName} (${user.matricNo})`);
    console.log(`   Email:   ${targetEmail}`);
    console.log(`   Code:    ${resetCode}`);
    console.log(`   Expires: 15 minutes from now`);
    console.log(`======================================================\n`);

    // Dispatch email asynchronously
    sendPasswordResetEmail(targetEmail, user.fullName, resetCode)
      .then(result => {
        if (result && result.previewUrl) {
          console.log(`🔗 [Ethereal Reset Preview]: ${result.previewUrl}`);
        }
      })
      .catch(err => console.error('[EMAIL ERROR] Reset email dispatch failed:', err));

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${emailHint}.`,
      emailHint,
      devCode: resetCode
    });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// Verify 6-digit Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const identifier = (req.body.identifier || '').trim();
    const code = (req.body.code || '').trim();

    if (!identifier || !code) {
      return res.status(400).json({ error: 'Matric number/email and 6-digit code are required.' });
    }

    let user = await db.getUserByMatric(identifier);
    if (!user) user = await db.getUserByEmail(identifier);

    if (!user) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    if (new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
    }

    res.json({ success: true, message: 'Code verified successfully.' });
  } catch (error) {
    console.error('[AUTH] Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// Complete Password Reset
router.post('/reset-password', async (req, res) => {
  try {
    const identifier = (req.body.identifier || '').trim();
    const code = (req.body.code || '').trim();
    const newPassword = req.body.newPassword || '';

    if (!identifier || !code || !newPassword) {
      return res.status(400).json({ error: 'Identifier, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    let user = await db.getUserByMatric(identifier);
    if (!user) user = await db.getUserByEmail(identifier);

    if (!user) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ error: 'This verification code has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user record & wipe reset codes
    await db.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null
    });

    await db.logActivity(user.id, 'password_reset', { timestamp: new Date().toISOString() });
    console.log(`✅ [PASSWORD RESET SUCCESS] Password updated for student: ${user.matricNo}`);

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in.'
    });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

export default router;
