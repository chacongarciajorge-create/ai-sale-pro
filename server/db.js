const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS business_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT, -- contractor, restaurant, cafe, coffee_shop
      google_review_link TEXT,
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      email TEXT,
      service_needed TEXT,
      urgency TEXT,
      status TEXT DEFAULT 'new', -- new, qualified, cold, warm, hot, booked
      source TEXT, -- chat, sms, missed_call
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_contacted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      role TEXT, -- user, assistant
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      booking_time DATETIME,
      service_type TEXT,
      status TEXT DEFAULT 'confirmed',
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    );
  `);

  return db;
}

module.exports = { setupDb };
