import express from 'express';
import db from '../utils/db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin guard to all routes
router.use(verifyAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    // omit passwords
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Disable/Enable a user account
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { disabled } = req.body;
    const updatedUser = await db.updateUser(id, { disabled });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    
    // Log it
    await db.logActivity('admin-1', 'user_status_changed', { targetUserId: id, disabled });
    
    res.json({ id: updatedUser.id, disabled: updatedUser.disabled });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a user (permanent)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users.splice(idx, 1);
      // Remove their activity too
      db.activityLog = db.activityLog.filter(log => log.userId !== id);
      res.json({ message: 'User permanently deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get global activity log (sees everything, including hidden)
router.get('/activity', async (req, res) => {
  try {
    const logs = await db.getAllActivity();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Broadcast a notification
router.post('/broadcast', async (req, res) => {
  try {
    const { message, targetGroup } = req.body;
    const notification = {
      id: Date.now().toString(),
      message,
      targetGroup: targetGroup || 'all',
      timestamp: new Date().toISOString()
    };
    db.notifications.push(notification);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
