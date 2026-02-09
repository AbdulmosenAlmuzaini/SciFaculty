const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/database.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_id TEXT UNIQUE,
    username TEXT,
    text TEXT,
    images TEXT, -- JSON string array
    status TEXT DEFAULT 'New', -- New, Reviewed, Published
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

function saveTweet(tweet) {
  const { tweet_id, username, text, images } = tweet;
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO tweets (tweet_id, username, text, images)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(tweet_id, username, text, JSON.stringify(images));
}

function getTweets(limit = 50) {
  const stmt = db.prepare('SELECT * FROM tweets ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit).map(t => ({
    ...t,
    images: JSON.parse(t.images)
  }));
}

function updateTweetStatus(id, status) {
  const stmt = db.prepare('UPDATE tweets SET status = ? WHERE id = ?');
  return stmt.run(status, id);
}

function isTweetProcessed(tweet_id) {
  const stmt = db.prepare('SELECT id FROM tweets WHERE tweet_id = ?');
  const result = stmt.get(tweet_id);
  return !!result;
}

module.exports = {
  saveTweet,
  getTweets,
  updateTweetStatus,
  isTweetProcessed
};
