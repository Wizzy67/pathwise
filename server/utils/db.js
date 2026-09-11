import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data files exist for local resilient fallback
const USERS_FILE = path.join(DATA_DIR, 'users_store.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity_store.json');
const CHAT_FILE = path.join(DATA_DIR, 'chat_store.json');

const readJsonSafe = (filePath, defaultVal = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf8');
      return defaultVal;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[DB FALLBACK] Could not read ${path.basename(filePath)}, resetting:`, err.message);
    return defaultVal;
  }
};

const writeJsonSafe = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[DB FALLBACK] Could not write ${path.basename(filePath)}:`, err.message);
  }
};

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
let isMongoConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { 
    family: 4, 
    serverSelectionTimeoutMS: 3000 // fail fast if Atlas cluster is paused or unreachable
  })
    .then(() => {
      isMongoConnected = true;
      console.log('✅ MongoDB connected successfully to Atlas');
    })
    .catch((err) => {
      isMongoConnected = false;
      console.warn('⚠️ MongoDB Atlas connection skipped/failed (using local resilient storage):', err.message);
    });
} else {
  console.warn('⚠️ MONGODB_URI is not set! Using local resilient storage.');
}

// Track mongoose connection state
mongoose.connection.on('connected', () => { isMongoConnected = true; });
mongoose.connection.on('disconnected', () => { isMongoConnected = false; });
mongoose.connection.on('error', () => { isMongoConnected = false; });

const isDbLive = () => isMongoConnected && mongoose.connection.readyState === 1;

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
}, { strict: false });

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

// --- User Operations ---

export const createUser = async (userData) => {
  const newUser = {
    id: userData.id || uuidv4(),
    ...userData,
    cgpa: userData.cgpa || null,
    savedCareers: userData.savedCareers || [],
    xp: userData.xp || 0,
    level: userData.level || '100', 
    createdAt: userData.createdAt || new Date().toISOString()
  };

  if (isDbLive()) {
    try {
      let existing = await User.findOne({ id: newUser.id });
      if (existing) return existing.toObject();
      if (newUser.matricNo) {
        existing = await User.findOne({ matricNo: newUser.matricNo });
        if (existing) return existing.toObject();
      }
      const created = await User.create(newUser);
      return created.toObject();
    } catch (e) {
      console.warn('[DB] Mongo save failed, writing to local store:', e.message);
    }
  }

  // Fallback
  const users = readJsonSafe(USERS_FILE);
  const existing = users.find(u => u.id === newUser.id || (newUser.matricNo && u.matricNo === newUser.matricNo));
  if (existing) return existing;
  users.push(newUser);
  writeJsonSafe(USERS_FILE, users);
  return newUser;
};

export const getUserByMatric = async (matricNo) => {
  if (isDbLive()) {
    try {
      const user = await User.findOne({ matricNo });
      if (user) return user.toObject();
    } catch (e) {
      console.warn('[DB] Mongo query failed, checking local store:', e.message);
    }
  }
  const users = readJsonSafe(USERS_FILE);
  return users.find(u => u.matricNo?.toLowerCase() === matricNo?.toLowerCase()) || null;
};

export const getUserByEmail = async (email) => {
  if (isDbLive()) {
    try {
      const user = await User.findOne({ email });
      if (user) return user.toObject();
    } catch (e) {
      console.warn('[DB] Mongo query failed, checking local store:', e.message);
    }
  }
  const users = readJsonSafe(USERS_FILE);
  return users.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || null;
};

export const getUserById = async (id) => {
  if (isDbLive()) {
    try {
      const user = await User.findOne({ id });
      if (user) return user.toObject();
    } catch (e) {
      console.warn('[DB] Mongo query failed, checking local store:', e.message);
    }
  }
  const users = readJsonSafe(USERS_FILE);
  return users.find(u => u.id === id) || null;
};

export const updateUser = async (id, data) => {
  if (isDbLive()) {
    try {
      const user = await User.findOneAndUpdate({ id }, { $set: data }, { new: true });
      if (user) return user.toObject();
    } catch (e) {
      console.warn('[DB] Mongo update failed, updating local store:', e.message);
    }
  }
  const users = readJsonSafe(USERS_FILE);
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...data };
    writeJsonSafe(USERS_FILE, users);
    return users[idx];
  }
  return null;
};

// --- Activity Operations ---

export const logActivity = async (userId, action, metadata = {}) => {
  const log = {
    id: uuidv4(),
    userId,
    action,
    metadata,
    hiddenByUser: false,
    timestamp: new Date().toISOString()
  };

  const xpAwards = {
    'quiz_completed': 100,
    'career_saved': 10,
    'roadmap_viewed': 5,
    'ai_query': 2,
    'report_downloaded': 50
  };

  if (isDbLive()) {
    try {
      const createdLog = await ActivityLog.create(log);
      if (xpAwards[action]) {
        const user = await User.findOne({ id: userId });
        if (user) {
          const newXp = (user.xp || 0) + xpAwards[action];
          await User.findOneAndUpdate({ id: userId }, { $set: { xp: newXp } });
        }
      }
      return createdLog.toObject();
    } catch (e) {
      console.warn('[DB] Mongo activity log failed, writing to local store:', e.message);
    }
  }

  // Fallback
  const logs = readJsonSafe(ACTIVITY_FILE);
  logs.unshift(log);
  writeJsonSafe(ACTIVITY_FILE, logs);

  if (xpAwards[action]) {
    const users = readJsonSafe(USERS_FILE);
    const uIdx = users.findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].xp = (users[uIdx].xp || 0) + xpAwards[action];
      writeJsonSafe(USERS_FILE, users);
    }
  }

  return log;
};

export const getUserActivity = async (userId, includeHidden = false) => {
  if (isDbLive()) {
    try {
      const filter = { userId };
      if (!includeHidden) filter.hiddenByUser = false;
      const logs = await ActivityLog.find(filter).sort({ timestamp: -1 });
      return logs.map(l => l.toObject());
    } catch (e) {
      console.warn('[DB] Mongo activity query failed, reading local store:', e.message);
    }
  }
  const logs = readJsonSafe(ACTIVITY_FILE);
  return logs.filter(l => l.userId === userId && (includeHidden || !l.hiddenByUser));
};

export const getAllUsers = async () => {
  if (isDbLive()) {
    try {
      const users = await User.find({});
      return users.map(u => u.toObject());
    } catch (e) {}
  }
  return readJsonSafe(USERS_FILE);
};

export const getAllActivity = async () => {
  if (isDbLive()) {
    try {
      const logs = await ActivityLog.find({}).sort({ timestamp: -1 });
      return logs.map(l => l.toObject());
    } catch (e) {}
  }
  return readJsonSafe(ACTIVITY_FILE);
};

export const hideUserActivity = async (userId) => {
  if (isDbLive()) {
    try {
      await ActivityLog.updateMany({ userId }, { $set: { hiddenByUser: true } });
      return;
    } catch (e) {}
  }
  const logs = readJsonSafe(ACTIVITY_FILE);
  logs.forEach(l => { if (l.userId === userId) l.hiddenByUser = true; });
  writeJsonSafe(ACTIVITY_FILE, logs);
};

// --- Chat Operations ---

export const createChatSession = async (userId, title, initialMessages = []) => {
  const session = {
    id: uuidv4(),
    userId,
    title,
    messages: initialMessages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDbLive()) {
    try {
      const created = await ChatSession.create(session);
      return created.toObject();
    } catch (e) {}
  }
  const sessions = readJsonSafe(CHAT_FILE);
  sessions.unshift(session);
  writeJsonSafe(CHAT_FILE, sessions);
  return session;
};

export const getChatSessions = async (userId) => {
  if (isDbLive()) {
    try {
      const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
      return sessions.map(s => s.toObject());
    } catch (e) {}
  }
  const sessions = readJsonSafe(CHAT_FILE);
  return sessions.filter(s => s.userId === userId);
};

export const getChatSessionById = async (id) => {
  if (isDbLive()) {
    try {
      const session = await ChatSession.findOne({ id });
      if (session) return session.toObject();
    } catch (e) {}
  }
  const sessions = readJsonSafe(CHAT_FILE);
  return sessions.find(s => s.id === id) || null;
};

export const addMessagesToSession = async (sessionId, messages) => {
  if (isDbLive()) {
    try {
      const session = await ChatSession.findOneAndUpdate(
        { id: sessionId },
        { 
          $push: { messages: { $each: messages } },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true }
      );
      if (session) return session.toObject();
    } catch (e) {}
  }
  const sessions = readJsonSafe(CHAT_FILE);
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].messages = [...(sessions[idx].messages || []), ...messages];
    sessions[idx].updatedAt = new Date().toISOString();
    writeJsonSafe(CHAT_FILE, sessions);
    return sessions[idx];
  }
  return null;
};

export const deleteChatSession = async (id) => {
  if (isDbLive()) {
    try {
      const result = await ChatSession.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (e) {}
  }
  const sessions = readJsonSafe(CHAT_FILE);
  const filtered = sessions.filter(s => s.id !== id);
  writeJsonSafe(CHAT_FILE, filtered);
  return true;
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