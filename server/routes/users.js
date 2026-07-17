import express from 'express';
import db from '../utils/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Don't send password hash
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, faculty, department, level, cgpa } = req.body;
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (faculty !== undefined) updates.faculty = faculty;
    if (department !== undefined) updates.department = department;
    if (level !== undefined) updates.level = String(level);
    
    if (cgpa !== undefined) {
      const parsed = parseFloat(cgpa);
      updates.cgpa = isNaN(parsed) ? null : parsed;
    }

    const updatedUser = await db.updateUser(req.user.id, updates);
    await db.logActivity(req.user.id, 'profile_updated', updates);
    
    const { password, ...userProfile } = updatedUser;
    res.json(userProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a career
router.post('/save-career', verifyToken, async (req, res) => {
  try {
    const { careerId } = req.body;
    if (!careerId) return res.status(400).json({ error: 'careerId is required' });
    
    let user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found. Please log out and log back in.' });

    if (!user.savedCareers) user.savedCareers = [];

    if (!user.savedCareers.includes(careerId)) {
      const updatedSaved = [...user.savedCareers, careerId];
      await db.updateUser(req.user.id, { savedCareers: updatedSaved });
      await db.logActivity(req.user.id, 'career_saved', { careerId });
      res.json({ savedCareers: updatedSaved, message: 'Career saved!' });
    } else {
      res.json({ savedCareers: user.savedCareers, message: 'Career already saved!' });
    }
  } catch (error) {
    console.error('save-career error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsave a career
router.delete('/save-career/:careerId', verifyToken, async (req, res) => {
  try {
    const { careerId } = req.params;
    let user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found. Please log out and log back in.' });

    if (!user.savedCareers) user.savedCareers = [];

    const updatedSaved = user.savedCareers.filter(id => id !== careerId);
    await db.updateUser(req.user.id, { savedCareers: updatedSaved });
    await db.logActivity(req.user.id, 'career_unsaved', { careerId });
    res.json({ savedCareers: updatedSaved });
  } catch (error) {
    console.error('unsave-career error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user activity
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const activity = await db.getUserActivity(req.user.id);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear user activity (hide from user view)
router.delete('/activity', verifyToken, async (req, res) => {
  try {
    await db.hideUserActivity(req.user.id);
    res.json({ message: 'Activity log cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
