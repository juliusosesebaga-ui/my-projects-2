const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Simple in-memory + file-based session store
let sessionsCache = {};

// Load sessions from disk on startup
function loadSessions() {
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      sessionsCache = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Failed to load sessions:', e.message);
      sessionsCache = {};
    }
  }
}

// Save sessions to disk
function saveSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsCache, null, 2), 'utf-8');
}

// Get or create session
function getSession(phoneNumber) {
  if (!sessionsCache[phoneNumber]) {
    sessionsCache[phoneNumber] = {
      phone: phoneNumber,
      stage: 'greeting', // greeting, qualification, estimate, negotiation, scheduling, closed
      collectedFields: {
        problemType: null,
        location: null,
        urgency: null,
        photoProvided: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
  }
  return sessionsCache[phoneNumber];
}

// Update session
function updateSession(phoneNumber, session) {
  session.updatedAt = new Date().toISOString();
  sessionsCache[phoneNumber] = session;
  saveSessions();
}

// Get all sessions
function getAllSessions() {
  return sessionsCache;
}

// Initialize on load
loadSessions();

module.exports = {
  getSession,
  updateSession,
  getAllSessions,
  loadSessions,
  saveSessions
};
