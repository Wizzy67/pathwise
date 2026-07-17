import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { family: 4 })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection FAILED:', err.message));
} else {
  console.warn('⚠️ MONGODB_URI is not set in .env! Database connection skipped.');
}

// Schema Definitions
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  matricNo: { type: String, required: true, unique: true },
  faculty: { type: String },
  department: { type: String },
  level: { type: String },
  cgpa: { type: Number, default: null },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  savedCareers: { type: Array, default: [] },
  xp: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false }); // strict: false allows dynamic fields safely

const activityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  action: { type: String, required: true },
  metadata: { type: Object, default: {} },
  hiddenByUser: { type: Boolean, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const chatSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: { type: Array, default: [] },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const User = mongoose.model('User', userSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export const createUser = async (userData) => {
  const newUser = {
    id: userData.id || uuidv4(),
    ...userData,
    cgpa: userData.cgpa || null,
    savedCareers: userData.savedCareers || [],
    xp: userData.xp || 0,
    level: userData.level || 1, 
    createdAt: userData.createdAt || new Date().toISOString()
  };

  // Check existing
  let existing = await User.findOne({ id: newUser.id });
  if (existing) return existing.toObject();
  
  if (newUser.matricNo) {
    existing = await User.findOne({ matricNo: newUser.matricNo });
    if (existing) return existing.toObject();
  }

  const created = await User.create(newUser);
  return created.toObject();
};

export const getUserByMatric = async (matricNo) => {
  const user = await User.findOne({ matricNo });
  return user ? user.toObject() : null;
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user ? user.toObject() : null;
};

export const getUserById = async (id) => {
  const user = await User.findOne({ id });
  return user ? user.toObject() : null;
};

export const updateUser = async (id, data) => {
  const user = await User.findOneAndUpdate({ id }, { $set: data }, { new: true });
  return user ? user.toObject() : null;
};

export const logActivity = async (userId, action, metadata = {}) => {
  const log = {
    id: uuidv4(),
    userId,
    action,
    metadata,
    hiddenByUser: false,
    timestamp: new Date().toISOString()
  };
  
  const createdLog = await ActivityLog.create(log);

  // Award XP
  const xpAwards = {
    'quiz_completed': 100,
    'career_saved': 10,
    'roadmap_viewed': 5,
    'ai_query': 2,
    'report_downloaded': 50
  };

  if (xpAwards[action]) {
    const user = await User.findOne({ id: userId });
    if (user) {
      const newXp = (user.xp || 0) + xpAwards[action];
      await User.findOneAndUpdate({ id: userId }, { $set: { xp: newXp } });
    }
  }

  return createdLog.toObject();
};

export const getUserActivity = async (userId, includeHidden = false) => {
  const filter = { userId };
  if (!includeHidden) {
    filter.hiddenByUser = false;
  }
  
  const logs = await ActivityLog.find(filter).sort({ timestamp: -1 });
  return logs.map(l => l.toObject());
};

export const getAllUsers = async () => {
  const users = await User.find({});
  return users.map(u => u.toObject());
};

export const getAllActivity = async () => {
  const logs = await ActivityLog.find({}).sort({ timestamp: -1 });
  return logs.map(l => l.toObject());
};

export const hideUserActivity = async (userId) => {
  await ActivityLog.updateMany({ userId }, { $set: { hiddenByUser: true } });
};

// Chat Session Functions
export const createChatSession = async (userId, title, initialMessages = []) => {
  const session = {
    id: uuidv4(),
    userId,
    title,
    messages: initialMessages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const created = await ChatSession.create(session);
  return created.toObject();
};

export const getChatSessions = async (userId) => {
  const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
  return sessions.map(s => s.toObject());
};

export const getChatSessionById = async (id) => {
  const session = await ChatSession.findOne({ id });
  return session ? session.toObject() : null;
};

export const addMessagesToSession = async (sessionId, messages) => {
  const session = await ChatSession.findOneAndUpdate(
    { id: sessionId },
    { 
      $push: { messages: { $each: messages } },
      $set: { updatedAt: new Date().toISOString() }
    },
    { new: true }
  );
  return session ? session.toObject() : null;
};

export const deleteChatSession = async (id) => {
  const result = await ChatSession.deleteOne({ id });
  return result.deletedCount > 0;
};

export default {
  createUser,
  getUserByMatric,
  getUserByEmail,
  getUserById,
  updateUser,
  logActivity,
  getUserActivity,
  getAllUsers,
  getAllActivity,
  hideUserActivity,
  createChatSession,
  getChatSessions,
  getChatSessionById,
  addMessagesToSession,
  deleteChatSession,
};
