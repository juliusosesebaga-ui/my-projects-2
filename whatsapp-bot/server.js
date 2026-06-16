const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { getAIResponse } = require('./openai');
const { sendOwnerNotification } = require('./owner-notifications');
const { getSession, updateSession } = require('./sessions');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/', (req, res) => res.send('WhatsApp plumbing bot running'));

// Dashboard: view recent notifications and events
app.get('/dashboard', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const notifFile = path.join(__dirname, 'notifications.json');
  let notifications = [];
  if (fs.existsSync(notifFile)) {
    try {
      notifications = JSON.parse(fs.readFileSync(notifFile, 'utf-8'));
    } catch (e) {
      notifications = [];
    }
  }
  res.json({ notifications: notifications.slice(-20), status: 'running' });
});

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'verify_token_here';
  const allowedTokens = new Set([VERIFY_TOKEN]);
  if (!process.env.WEBHOOK_VERIFY_TOKEN) {
    allowedTokens.add('verify_token');
    allowedTokens.add('verify_token_here');
  }
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && allowedTokens.has(token)) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    // Support Meta WhatsApp Cloud API format
    if (body.object && body.entry) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const messages = value.messages || [];
          for (const message of messages) {
            const from = message.from;
            const incoming = message.text?.body || message.caption || '';
            const hasMedia = !!(message.image || message.document || message.audio || message.video);
            const mediaType = Object.keys(message).find(k => ['image', 'document', 'audio', 'video'].includes(k));

            // Load or create session for this user
            const session = getSession(from);
            session.lastMessage = incoming;
            session.hasPhoto = hasMedia && mediaType === 'image';
            updateSession(from, session);

            // Generate an AI reply
            const reply = await getAIResponse(incoming, { 
              userPhone: from, 
              session,
              hasMedia,
              mediaType
            });

            // Send reply via WhatsApp Cloud API (if credentials are set)
            if (WA_TOKEN && PHONE_NUMBER_ID) {
              try {
                await axios.post(
                  `https://graph.facebook.com/v16.0/${PHONE_NUMBER_ID}/messages`,
                  {
                    messaging_product: 'whatsapp',
                    to: from,
                    text: { body: reply }
                  },
                  {
                    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' }
                  }
                );
              } catch (sendErr) {
                console.error('Failed to send reply via WhatsApp API:', sendErr.response?.data || sendErr.message);
                // Notify owner of API failure
                await sendOwnerNotification({
                  type: 'api_error',
                  phone: from,
                  error: sendErr.response?.data?.error?.message || sendErr.message,
                  timestamp: new Date().toISOString()
                });
              }
            } else {
              console.log('Simulated send ->', { to: from, text: reply });
            }

            // Log important business events
            if (incoming.toLowerCase().includes('schedule') || incoming.toLowerCase().includes('book')) {
              await sendOwnerNotification({
                type: 'booking_inquiry',
                phone: from,
                message: incoming,
                timestamp: new Date().toISOString()
              });
            }
            if (hasMedia && mediaType === 'image') {
              await sendOwnerNotification({
                type: 'photo_received',
                phone: from,
                timestamp: new Date().toISOString()
              });
            }
            if (incoming.toLowerCase().includes('price') || incoming.toLowerCase().includes('cost')) {
              await sendOwnerNotification({
                type: 'price_negotiation',
                phone: from,
                message: incoming,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
      return res.sendStatus(200);
    }

    // Optional verification for webhook setup
    if (req.query['hub.mode'] && req.query['hub.verify_token']) {
      const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'verify_token';
      if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        return res.status(200).send(req.query['hub.challenge']);
      }
      return res.sendStatus(403);
    }

    res.sendStatus(404);
  } catch (err) {
    console.error(err);
    await sendOwnerNotification({
      type: 'server_error',
      error: err.message,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Failed to notify owner:', e));
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
