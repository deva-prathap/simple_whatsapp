const db = require('../config/db');

class Session {
  static async save(sessionData, expiresAt) {
    try {
      await db.query(
        'INSERT INTO whatsapp_sessions (session_data, expires_at) VALUES (?, ?)',
        [JSON.stringify(sessionData), expiresAt]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  static async getLatest() {
    try {
      const [sessions] = await db.query(
        'SELECT session_data FROM whatsapp_sessions WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 1'
      );
      return sessions[0]?.session_data ? JSON.parse(sessions[0].session_data) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  static async clearExpired() {
    try {
      await db.query('DELETE FROM whatsapp_sessions WHERE expires_at <= NOW()');
    } catch (error) {
      console.error('Error clearing expired sessions:', error);
    }
  }
}

// Clear expired sessions on startup
Session.clearExpired();

module.exports = Session;