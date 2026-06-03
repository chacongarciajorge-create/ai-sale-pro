const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { setupDb } = require('./db');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let db;

// Initialize Database
setupDb().then(database => {
  db = database;
  console.log('Database connected');
});

// AI Qualification Mock Logic
const qualifyLead = async (leadId, message) => {
  const lead = await db.get('SELECT * FROM leads WHERE id = ?', [leadId]);
  const business = await db.get('SELECT * FROM business_profile LIMIT 1');
  const conversations = await db.all('SELECT * FROM conversations WHERE lead_id = ? ORDER BY timestamp DESC LIMIT 5', [leadId]);
  
  const industry = business?.type || 'contractor';
  const msg = message.toLowerCase();

  let aiMessage = "";
  let statusUpdate = null;

  // Simple rule-based logic to simulate AI behavior for different industries
  if (conversations.length <= 1) {
    if (industry === 'contractor') {
      aiMessage = `Hi! Thanks for reaching out to ${business.name}. What kind of project can we help you with? (Roofing, Plumbing, HVAC, etc.)`;
    } else if (industry === 'restaurant') {
      aiMessage = `Welcome to ${business.name}! Would you like to make a reservation or check our menu?`;
    } else {
      aiMessage = `Hi! How can we help you at ${business.name} today?`;
    }
  } else if (msg.includes('book') || msg.includes('reservation') || msg.includes('appointment')) {
    if (industry === 'contractor') {
      aiMessage = "I can get that scheduled for an estimate. Does next Tuesday morning work for you?";
    } else if (industry === 'restaurant') {
      aiMessage = "Great! For how many people and what time?";
    } else {
      aiMessage = "Sure! When would you like to come in?";
    }
  } else if (msg.match(/\d{3}/)) { // Simple phone number check
    aiMessage = `Perfect, I've saved your contact info. One of our team members will confirm your booking shortly!`;
    statusUpdate = 'booked';
    
    // Simulate auto-booking
    await db.run('INSERT INTO bookings (lead_id, booking_time, service_type) VALUES (?, datetime("now", "+3 days"), ?)', 
      [leadId, lead.service_needed || 'General']);
  } else {
    aiMessage = "Got it. To finalize this, could you please provide your phone number?";
  }

  if (statusUpdate) {
    await db.run('UPDATE leads SET status = ?, last_contacted_at = CURRENT_TIMESTAMP WHERE id = ?', [statusUpdate, leadId]);
  } else {
    await db.run('UPDATE leads SET last_contacted_at = CURRENT_TIMESTAMP WHERE id = ?', [leadId]);
  }

  await db.run('INSERT INTO conversations (lead_id, role, content) VALUES (?, ?, ?)', [leadId, 'assistant', aiMessage]);
  return aiMessage;
};

// Missed Call Simulation
app.post('/api/simulate-missed-call', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  
  // 1. Create lead
  const result = await db.run(
    'INSERT INTO leads (name, phone, source, status) VALUES (?, ?, ?, ?)',
    ['Missed Call Lead', phone, 'missed_call', 'new']
  );
  const leadId = result.lastID;

  // 2. Send instant text back (AI initiated)
  const business = await db.get('SELECT * FROM business_profile LIMIT 1');
  const aiMessage = `Hi, this is ${business.name}. Sorry we missed your call! How can we help you today?`;
  
  await db.run('INSERT INTO conversations (lead_id, role, content) VALUES (?, ?, ?)', [leadId, 'assistant', aiMessage]);
  
  res.json({ success: true, leadId });
}));

// Routes
app.get('/api/leads', asyncHandler(async (req, res) => {
  const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC');
  res.json(leads);
}));

app.post('/api/leads', asyncHandler(async (req, res) => {
  const { name, phone, email, source } = req.body;
  const result = await db.run(
    'INSERT INTO leads (name, phone, email, source) VALUES (?, ?, ?, ?)',
    [name, phone, email, source]
  );
  res.json({ id: result.lastID });
}));

app.get('/api/leads/:id/conversations', asyncHandler(async (req, res) => {
  const conversations = await db.all('SELECT * FROM conversations WHERE lead_id = ? ORDER BY timestamp ASC', [req.params.id]);
  res.json(conversations);
}));

app.post('/api/chat', asyncHandler(async (req, res) => {
  const { leadId, message } = req.body;
  
  let currentLeadId = leadId;
  if (!currentLeadId) {
    const result = await db.run('INSERT INTO leads (source) VALUES (?)', ['chat']);
    currentLeadId = result.lastID;
  }

  await db.run('INSERT INTO conversations (lead_id, role, content) VALUES (?, ?, ?)', [currentLeadId, 'user', message]);
  
  const aiResponse = await qualifyLead(currentLeadId, message);
  
  res.json({ leadId: currentLeadId, message: aiResponse });
}));

app.get('/api/business', asyncHandler(async (req, res) => {
  const business = await db.get('SELECT * FROM business_profile LIMIT 1');
  res.json(business || {});
}));

app.post('/api/business', asyncHandler(async (req, res) => {
  const { name, type, google_review_link, phone, email } = req.body;
  const existing = await db.get('SELECT * FROM business_profile LIMIT 1');
  if (existing) {
    await db.run(
      'UPDATE business_profile SET name = ?, type = ?, google_review_link = ?, phone = ?, email = ? WHERE id = ?',
      [name, type, google_review_link, phone, email, existing.id]
    );
  } else {
    await db.run(
      'INSERT INTO business_profile (name, type, google_review_link, phone, email) VALUES (?, ?, ?, ?, ?)',
      [name, type, google_review_link, phone, email]
    );
  }
  res.json({ success: true });
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
