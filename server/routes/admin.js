import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { verifyAdmin } from '../middleware/auth.js';
import { dataCache } from '../server.js';

const router = express.Router();

// Apply admin guard to all routes
router.use(verifyAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats — Comprehensive Dashboard Analytics & KPIs
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const allUsers = await db.getAllUsers();
    const students = allUsers.filter(u => u.role !== 'admin');

    const totalStudents = students.length;
    const assessedStudents = students.filter(s => Array.isArray(s.quizResults) && s.quizResults.length > 0);
    const completedAssessments = assessedStudents.length;

    // Average CGPA
    const studentsWithCgpa = students.filter(s => typeof s.cgpa === 'number' && !isNaN(s.cgpa) && s.cgpa > 0);
    const avgCgpa = studentsWithCgpa.length > 0
      ? (studentsWithCgpa.reduce((sum, s) => sum + s.cgpa, 0) / studentsWithCgpa.length).toFixed(2)
      : '0.00';

    // Faculty breakdown
    const facultyCounts = {};
    students.forEach(s => {
      const fac = s.faculty || 'Unassigned';
      facultyCounts[fac] = (facultyCounts[fac] || 0) + 1;
    });

    // Level breakdown
    const levelCounts = { '100L': 0, '200L': 0, '300L': 0, '400L': 0, '500L': 0 };
    students.forEach(s => {
      const lvl = s.level ? (s.level.endsWith('L') ? s.level : `${s.level}L`) : '100L';
      levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    });

    // Average RIASEC Scores across assessed students
    const riasecTotals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    let assessedCount = 0;
    assessedStudents.forEach(s => {
      if (s.riasecScores && typeof s.riasecScores === 'object') {
        assessedCount++;
        Object.keys(riasecTotals).forEach(dim => {
          riasecTotals[dim] += parseInt(s.riasecScores[dim]) || 0;
        });
      }
    });

    const riasecAverage = {};
    Object.keys(riasecTotals).forEach(dim => {
      riasecAverage[dim] = assessedCount > 0 ? Math.round(riasecTotals[dim] / assessedCount) : 0;
    });

    // Top Matched Careers Leaderboard
    const careerTally = {};
    assessedStudents.forEach(s => {
      const top = s.quizResults[0]?.careerId;
      if (top) {
        careerTally[top] = (careerTally[top] || 0) + 1;
      }
    });

    const careersList = Array.isArray(dataCache?.careers) ? dataCache.careers : [];
    const topCareers = Object.entries(careerTally)
      .map(([careerId, count]) => {
        const found = careersList.find(c => c.id === careerId);
        return {
          id: careerId,
          title: found ? found.title : careerId,
          field: found ? found.field : 'General',
          count,
          percentage: completedAssessments > 0 ? Math.round((count / completedAssessments) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Recent registrations in the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentRegistrations = students.filter(s => s.createdAt && s.createdAt >= oneWeekAgo).length;

    res.json({
      totalStudents,
      completedAssessments,
      assessmentRate: totalStudents > 0 ? Math.round((completedAssessments / totalStudents) * 100) : 0,
      avgCgpa,
      recentRegistrations,
      careersCount: careersList.length,
      coursesCount: Array.isArray(dataCache?.courses) ? dataCache.courses.length : 0,
      questionsCount: Array.isArray(dataCache?.questions) ? dataCache.questions.length : 0,
      facultyCounts,
      levelCounts,
      riasecAverage,
      topCareers
    });
  } catch (error) {
    console.error('[ADMIN] Stats calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate admin stats' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /users — All Students Registry with Safe Projection
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const safeUsers = users
      .filter(u => u.role !== 'admin')
      .map(u => {
        const { password, ...rest } = u;
        return {
          ...rest,
          hasCompletedQuiz: Array.isArray(u.quizResults) && u.quizResults.length > 0,
          topCareer: u.quizResults?.[0]?.careerId || null,
          topScore: u.quizResults?.[0]?.score || null,
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json(safeUsers);
  } catch (error) {
    console.error('[ADMIN] Get users error:', error);
    res.status(500).json({ error: 'Server error retrieving student list' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /users/:id — Detailed Student Dossier
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.getUserById(id);
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const { password, ...safeUser } = user;
    const activities = await db.getUserActivity(id, true);
    const chats = await db.getChatSessions(id);

    // Enrich quiz matches with career titles from knowledge base
    const careersList = Array.isArray(dataCache?.careers) ? dataCache.careers : [];
    const enrichedResults = (user.quizResults || []).map(r => {
      const matched = careersList.find(c => c.id === r.careerId);
      return {
        ...r,
        title: matched?.title || r.careerId,
        field: matched?.field || 'General',
        salary: matched?.salary_range_ngn || 'N/A'
      };
    });

    res.json({
      user: safeUser,
      quizResults: enrichedResults,
      activities: activities.slice(0, 20),
      chatSessionCount: chats.length
    });
  } catch (error) {
    console.error('[ADMIN] Get student dossier error:', error);
    res.status(500).json({ error: 'Server error retrieving student profile' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /users/:id/status — Toggle Suspend / Active Student Status
// ─────────────────────────────────────────────────────────────────────────────
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { disabled } = req.body;
    const updatedUser = await db.updateUser(id, { disabled: !!disabled });
    if (!updatedUser) return res.status(404).json({ error: 'Student not found' });

    await db.logActivity('admin-1', 'user_status_changed', {
      targetUserId: id,
      matricNo: updatedUser.matricNo,
      disabled: updatedUser.disabled
    });

    res.json({ id: updatedUser.id, disabled: updatedUser.disabled, message: `Student account ${updatedUser.disabled ? 'suspended' : 'activated'}` });
  } catch (error) {
    console.error('[ADMIN] Status toggle error:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /users/:id/reset-password — Admin Password Reset for Locked Student
// ─────────────────────────────────────────────────────────────────────────────
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    const updatedUser = await db.updateUser(id, { password: hashedPassword });
    if (!updatedUser) return res.status(404).json({ error: 'Student not found' });

    await db.logActivity('admin-1', 'admin_password_reset', {
      targetUserId: id,
      matricNo: updatedUser.matricNo
    });

    res.json({ success: true, message: `Password successfully reset for ${updatedUser.matricNo}` });
  } catch (error) {
    console.error('[ADMIN] Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset student password' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /users/:id — Permanent Student Account Deletion
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.getUserById(id);
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const deleted = await db.deleteUser(id);
    if (!deleted) return res.status(500).json({ error: 'Failed to delete student record' });

    await db.logActivity('admin-1', 'user_deleted', {
      deletedUserId: id,
      matricNo: user.matricNo,
      fullName: user.fullName
    });

    res.json({ success: true, message: `Student record (${user.matricNo}) permanently deleted.` });
  } catch (error) {
    console.error('[ADMIN] Delete student error:', error);
    res.status(500).json({ error: 'Server error during student deletion' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /activity — Enriched System-Wide Audit Log
// ─────────────────────────────────────────────────────────────────────────────
router.get('/activity', async (req, res) => {
  try {
    const logs = await db.getAllActivity();
    const users = await db.getAllUsers();
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = { fullName: u.fullName, matricNo: u.matricNo, faculty: u.faculty };
    });

    const enrichedLogs = logs.map(log => ({
      ...log,
      studentName: userMap[log.userId]?.fullName || (log.userId === 'admin-1' ? 'System Administrator' : 'Unknown Student'),
      matricNo: userMap[log.userId]?.matricNo || (log.userId === 'admin-1' ? 'ADMIN' : '—')
    }));

    res.json(enrichedLogs);
  } catch (error) {
    console.error('[ADMIN] Get activity error:', error);
    res.status(500).json({ error: 'Server error loading audit activity' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /careers — Full Knowledge Base of Careers
// ─────────────────────────────────────────────────────────────────────────────
router.get('/careers', (req, res) => {
  try {
    const careers = Array.isArray(dataCache?.careers) ? dataCache.careers : [];
    res.json(careers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load career knowledge base' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcasts & POST /broadcast — Announcements Management
// ─────────────────────────────────────────────────────────────────────────────
router.get('/broadcasts', async (req, res) => {
  try {
    const list = await db.getBroadcasts();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, targetFaculty, targetLevel } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Announcement message cannot be empty' });
    }

    const broadcast = await db.createBroadcast({
      title: title?.trim() || 'Campus Notice',
      message: message.trim(),
      targetFaculty: targetFaculty || 'All',
      targetLevel: targetLevel || 'All',
      createdBy: req.user?.username || 'System Administrator'
    });

    await db.logActivity('admin-1', 'broadcast_created', { broadcastId: broadcast.id, title: broadcast.title });

    res.status(201).json(broadcast);
  } catch (error) {
    console.error('[ADMIN] Broadcast error:', error);
    res.status(500).json({ error: 'Failed to broadcast announcement' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /export/csv — Institutional CSV Data Export
// ─────────────────────────────────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const students = users.filter(u => u.role !== 'admin');
    const careersList = Array.isArray(dataCache?.careers) ? dataCache.careers : [];

    const headers = [
      'Full Name',
      'Matric Number',
      'Email',
      'Faculty',
      'Department',
      'Level',
      'CGPA',
      'Holland Code',
      'Top Career Match',
      'Match Score (%)',
      'Assessment Date',
      'Account Status',
      'Registered Date'
    ];

    const rows = students.map(s => {
      const topCareerId = s.quizResults?.[0]?.careerId;
      const topCareerTitle = topCareerId ? (careersList.find(c => c.id === topCareerId)?.title || topCareerId) : 'None';
      const topScore = s.quizResults?.[0]?.score || '—';
      const holland = s.hollandCode || '—';
      const status = s.disabled ? 'Suspended' : 'Active';

      return [
        `"${(s.fullName || '').replace(/"/g, '""')}"`,
        `"${(s.matricNo || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.faculty || '').replace(/"/g, '""')}"`,
        `"${(s.department || '').replace(/"/g, '""')}"`,
        `"${(s.level || '').replace(/"/g, '""')}"`,
        s.cgpa !== null && s.cgpa !== undefined ? s.cgpa : '—',
        `"${holland}"`,
        `"${topCareerTitle.replace(/"/g, '""')}"`,
        topScore,
        s.lastQuizDate ? `"${new Date(s.lastQuizDate).toLocaleDateString()}"` : 'Not Completed',
        `"${status}"`,
        s.createdAt ? `"${new Date(s.createdAt).toLocaleDateString()}"` : '—'
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=PathWise_Student_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('[ADMIN] CSV export error:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

export default router;
